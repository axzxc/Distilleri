// background.js - Distilleri Extension Service Worker

// ---------- INITIALIZATION ----------
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Distilleri] Extension installed/updated');
  
  export function createElement(...attr)
{
    const element = document.createElement(attr[0]);
    for (let i=1;i<attr.length;i++)
	{
		if (attr[i][0] == "innerHTML")
			element.innerHTML = attr[i][1];
		else
			element.setAttribute(attr[i][0],attr[i][1]);
	}
    return element;
}
  
  // Set default settings
  const defaultSettings = {
    opinionHighlight: true,
    fallacyDetection: true,
    autoDistill: false,
    selectionTooltip: true,
    apiKey: null,
    apiProvider: 'openai',        // 'openai', 'anthropic', etc.
    paidTier: false,
    licenseKey: null,
    licenseValidUntil: null,
    distillMode: 'full'           // 'full' or 'selection'
  };
  
  const stored = await chrome.storage.local.get('settings');
  if (!stored.settings) {
    await chrome.storage.local.set({ settings: defaultSettings });
  }
  
  // Create context menus
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'distillSelection',
      title: 'Distill Selection',
      contexts: ['selection']
    });
    chrome.contextMenus.create({
      id: 'distillPage',
      title: 'Distill Page',
      contexts: ['page']
    });
  });
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.settings) {
    console.log('[Distilleri] Settings updated:', changes.settings.newValue);
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'distillSelection') {
    // Send message to content script in the active tab
    chrome.tabs.sendMessage(tab.id, { action: 'distillSelection' });
  } else if (info.menuItemId === 'distillPage') {
    chrome.tabs.sendMessage(tab.id, { action: 'distillPage' });
  }
});

// Handle extension icon click (opens popup, not needed if popup defined)
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// ---------- MESSAGE HANDLER (from content script) ----------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeText') {
    // request.text: string (sentence or paragraph)
    // request.mode: 'full' or 'selection'
    analyzeText(request.text, request.mode)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // keeps messaging channel open for async response
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.local.get('settings').then(({ settings }) => {
      sendResponse(settings);
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.local.set({ settings: request.settings }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// ---------- CORE ANALYSIS LOGIC ----------
const cache = new Map(); // simple in‑memory cache: key = text hash, value = result

async function analyzeText(text, mode) {
  if (!text || text.trim().length === 0) {
    throw new Error('No text to analyze');
  }
  
  // Optional caching (1 hour)
  const cacheKey = `${text.length}_${text.slice(0, 100)}`;
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < 60 * 60 * 1000) {
    return cached.result;
  }
  
  const settings = await chrome.storage.local.get('settings');
  const { paidTier, apiKey, apiProvider } = settings;
  
  let result;
  if (paidTier && await isLicenseValid(settings)) {
    result = await analyzeWithLocalModel(text);
  } else {
    if (!apiKey) throw new Error('No API key provided. Please add your OpenAI/Anthropic key in settings.');
    result = await analyzeWithAPI(text, apiProvider, apiKey);
  }
  
  // Store in cache
  cache.set(cacheKey, { result, timestamp: Date.now() });
  return result;
}

// ---------- API MODE (Free tier) ----------
async function analyzeWithAPI(text, provider, apiKey) {
  // Split into sentences (simple regex – improve as needed)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  const prompt = `Analyze each sentence below. For each sentence, output JSON with:
  - "opinion_score": float from 0 (pure fact) to 1 (strong opinion)
  - "fallacy": one of ["ad_hominem","straw_man","appeal_to_authority","false_dilemma","slippery_slope","hasty_generalization","none"]
  
  Sentences:\n${sentences.map((s, i) => `${i+1}. ${s}`).join('\n')}
  
  Return a JSON array only, no extra text.`;

  let endpoint, headers, body;
  if (provider === 'openai') {
    endpoint = 'https://api.openai.com/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    body = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    });
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  
  const response = await fetch(endpoint, { method: 'POST', headers, body });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error: ${err}`);
  }
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    throw new Error(`Failed to parse API response: ${content}`);
  }
  
  // Ensure array length matches sentences
  if (!Array.isArray(parsed) || parsed.length !== sentences.length) {
    throw new Error('API returned malformed results');
  }
  
  return parsed.map((item, idx) => ({
    sentence: sentences[idx].trim(),
    opinion_score: item.opinion_score,
    fallacy: item.fallacy
  }));
}

// ---------- LOCAL MODEL MODE (Paid tier - stub) ----------
async function analyzeWithLocalModel(text) {
  // TODO: Implement Transformers.js or TensorFlow.js inference
  // For now, return dummy data (opinion scores based on keyword detection)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  return sentences.map(sentence => {
    let opinion_score = 0;
    if (/\b(dangerous|reckless|clearly|obviously|common sense|shameful)\b/i.test(sentence)) opinion_score = 0.8;
    else if (/\b(controversial|reportedly|many say|experts agree)\b/i.test(sentence)) opinion_score = 0.5;
    else opinion_score = 0.1;
    
    let fallacy = 'none';
    if (/\bad hominem\b/i.test(sentence)) fallacy = 'ad_hominem';
    else if (/\bstraw man\b/i.test(sentence)) fallacy = 'straw_man';
    else if (/\bexperts say\b/i.test(sentence)) fallacy = 'appeal_to_authority';
    
    return { sentence: sentence.trim(), opinion_score, fallacy };
  });
}

// ---------- LICENSE VALIDATION (simplified) ----------
async function isLicenseValid(settings) {
  if (!settings.paidTier || !settings.licenseKey) return false;
  const { licenseValidUntil } = settings;
  if (licenseValidUntil && new Date(licenseValidUntil) > new Date()) return true;
  
  // Optionally call your server to validate the key
  // For now, assume valid for 30 days from first use
  if (!licenseValidUntil) {
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);
    await chrome.storage.local.set({
      settings: { ...settings, licenseValidUntil: newExpiry.toISOString() }
    });
    return true;
  }
  return false;
}

// ---------- HELPER: TEST API KEY ----------
async function testApiKey(apiKey, provider) {
  try {
    // Minimal API call (e.g., list models for OpenAI)
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    return response.ok;
  } catch {
    return false;
  }
}
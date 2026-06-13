// Distilleri Content Script
// Handles opinion highlighting and fallacy detection on loaded pages

(function() {
  'use strict';

  // Fallacy data loaded from web_accessible_resources
  let fallacies = {};

  // Feature toggle state
  let state = {
    opinionHighlight: true,
    fallacyDetection: true,
    autoDistill: false,
    selectionTooltip: true
  };

  // Load fallacies from bundled JSON
  async function loadFallacies() {
    try {
      const response = await fetch(chrome.runtime.getURL('data/fallacies.json'));
      fallacies = await response.json();
      console.log('[Distilleri] Loaded', Object.keys(fallacies).length, 'fallacies');
    } catch (e) {
      console.error('[Distilleri] Failed to load fallacies:', e);
      fallacies = {};
    }
  }

  // Load extension state
  async function loadState() {
    const stored = await chrome.storage.local.get(['settings']);
    if (stored.settings) {
      state = { ...state, ...stored.settings };
    }
  }

  // Save state to storage
  async function saveState() {
    await chrome.storage.local.set({ settings: state });
  }

  // Opinion intensity scoring
  function analyzeTextForOpinion(text) {
    const opinions = [
      // Strong opinion words
      { words: ['absolutely', 'definitely', 'undoubtedly', 'clearly', 'obviously', 'evidently'], intensity: 3 },
      { words: ['strongly', 'highly', 'very', 'extremely', 'completely', 'totally'], intensity: 2 },
      { words: ['believe', 'think', 'feel', 'argue', 'claim', 'suggest'], intensity: 1.5 },
      { words: ['important', 'critical', 'essential', 'vital', 'necessary'], intensity: 1.5 },
      { words: ['wonderful', 'terrible', 'amazing', 'awful', 'horrible', 'fantastic'], intensity: 2 },
      { words: ['best', 'worst', 'perfect', 'useless', 'terrible'], intensity: 2.5 },
      // Emotion words
      { words: ['love', 'hate', 'worried', 'fear', 'angry', 'excited'], intensity: 2 },
      // Comparative claims
      { words: ['better', 'worse', 'superior', 'inferior'], intensity: 1.5 },
      // Absolute claims
      { words: ['always', 'never', 'everyone', 'no one', 'nothing', 'everything'], intensity: 2 },
    ];

    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let totalIntensity = 0;
    const mentions = new Set();

    opinions.forEach(group => {
      words.forEach(word => {
        if (group.words.includes(word) && !mentions.has(word)) {
          totalIntensity += group.intensity;
          mentions.add(word);
        }
      });
    });

    // Normalize to 0-1 scale (higher = more opinionated)
    const intensity = Math.min(1, totalIntensity / 10);
    return { intensity, mentions };
  }

  // Convert intensity to hue (pink → red)
  function intensityToHue(intensity) {
    // Map 0-1 to hue 300° (pink) → 0° (red)
    const hue = 300 - (intensity * 300);
    return hue;
  }

  // Generate color from hue
  function hueToColor(hue) {
    const s = 80; // saturation
    const l = 70; // lightness for light pink
    return `hsl(${hue}, ${s}%, ${l}%)`;
  }

  // Darker color for strong opinions
  function intensityToDarkColor(intensity) {
    const hue = intensityToHue(intensity);
    const s = 90;
    const l = 40; // darker for emphasis
    return `hsl(${hue}, ${s}%, ${l}%)`;
  }

  // Highlight text with opinion intensity
  function highlightOpinion(text) {
    if (!state.opinionHighlight) return text;

    const { intensity, mentions } = analyzeTextForOpinion(text);

    if (intensity < 0.1) return text;

    const color = intensityToColor(intensity);
    const darkColor = intensityToDarkColor(intensity);

    // Split text at word boundaries
    const parts = text.split(/(\b\w+\b)/g);

    return parts.map(part => {
      if (mentions.has(part.toLowerCase())) {
        return `<span style="background-color: ${color}; padding: 1px 0;">${part}</span>`;
      }
      return part;
    }).join('');
  }

  // Detect fallacies in text
  async function detectFallacies(text) {
    const fallacyNames = Object.values(fallacies).map(f => f.name.toLowerCase());
    const fallacyPatterns = Object.values(fallacies).map(f => f.name.toLowerCase().replace(/[^\w]/g, ''));

    // Simple pattern matching for now
    const detected = [];

    // Ad Hominem
    if (/\b(attack|attacking|person|character|credibility)\b/i.test(text)) {
      detected.push({ id: 'F-01', name: fallacies['F-01'].name });
    }

    // Straw Man
    if (/\b(misrepresent|distort|out of context|taking out of context)\b/i.test(text)) {
      detected.push({ id: 'F-02', name: fallacies['F-02'].name });
    }

    // Appeal to Authority
    if (/\b(famous|expert|authority|scientist|doctor)\b/i.test(text) && /\b(says|says so|claims|recommends)\b/i.test(text)) {
      detected.push({ id: 'F-03', name: fallacies['F-03'].name });
    }

    // False Dilemma
    if (/\b(either.*or|must be one of|only two options|only choice)\b/i.test(text)) {
      detected.push({ id: 'F-04', name: fallacies['F-04'].name });
    }

    // Slippery Slope
    if (/\b(if we.*then.*will|leads to|results in|causes)\b/i.test(text) && /\b(disaster|catastrophe|problem)\b/i.test(text)) {
      detected.push({ id: 'F-05', name: fallacies['F-05'].name });
    }

    // Circular Reasoning
    if (/\b(because.*therefore|since.*so|because.*which means)\b/i.test(text)) {
      detected.push({ id: 'F-06', name: fallacies['F-06'].name });
    }

    // Appeal to Popularity
    if (/\b(most people|everyone|millions|popular|trending)\b/i.test(text)) {
      detected.push({ id: 'F-07', name: fallacies['F-07'].name });
    }

    // Red Herring
    if (/\b(why worry.*when|but there are|forget about|ignore)\b/i.test(text)) {
      detected.push({ id: 'F-08', name: fallacies['F-08'].name });
    }

    // Appeal to Ignorance
    if (/\b(no one has proven|hasn't been proven|no evidence|unproven)\b/i.test(text)) {
      detected.push({ id: 'F-09', name: fallacies['F-09'].name });
    }

    // Hasty Generalization
    if (/\b(all|every|none|always|never)\b/i.test(text) && /\b(i met|in my experience|based on)\b/i.test(text)) {
      detected.push({ id: 'F-10', name: fallacies['F-10'].name });
    }

    // Post Hoc
    if (/\b(because.*after|because it followed|caused.*after)\b/i.test(text)) {
      detected.push({ id: 'F-11', name: fallacies['F-11'].name });
    }

    // Appeal to Nature
    if (/\b(natural|unnatural|artificial|organic)\b/i.test(text)) {
      detected.push({ id: 'F-12', name: fallacies['F-12'].name });
    }

    // Tu Quoque
    if (/\b(you say.*but you|you do the same|you too|same thing)\b/i.test(text)) {
      detected.push({ id: 'F-13', name: fallacies['F-13'].name });
    }

    // Genetic Fallacy
    if (/\b(origin|source|background|where they're from)\b/i.test(text)) {
      detected.push({ id: 'F-14', name: fallacies['F-14'].name });
    }

    // False Cause
    if (/\b(because.*before|because.*after|because.*then)\b/i.test(text)) {
      detected.push({ id: 'F-15', name: fallacies['F-15'].name });
    }

    return detected;
  }

  // Create fallacy tooltip
  function createFallacyTooltip(fallacyId) {
    const fallacy = fallacies[fallacyId];
    if (!fallacy) return null;

    return `
      <div style="
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      " class="fallacy-tooltip">
        <strong style="color: #c62828;">${fallacy.name}</strong>
        <p style="margin: 8px 0 0 0; font-size: 13px;">${fallacy.explanation}</p>
        <small style="color: #666;">ID: ${fallacyId}</small>
      </div>
    `;
  }

  // Extract main article content using Readability.js logic
  function extractArticleContent(document) {
    // Simple extraction: look for article, main, or content-rich elements
    const candidates = document.querySelectorAll('article, main, [role="main"], .article-content, .post-content, .content');

    if (candidates.length > 0) {
      return candidates[0];
    }

    // Fallback: find largest text block
    let largest = null;
    let largestSize = 0;

    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6').forEach(el => {
      const text = el.textContent || '';
      const size = text.length;
      if (size > largestSize && size > 50) {
        largestSize = size;
        largest = el;
      }
    });

    return largest || document.body;
  }

  // Main processing function
  async function processPage() {
    if (!state.autoDistill) {
      // Only process if user has indicated interest (e.g., via selection)
      return;
    }

    const article = extractArticleContent(document);
    if (!article) {
      console.log('[Distilleri] No article content found');
      return;
    }

    const text = article.textContent || '';

    // Highlight opinions
    const highlighted = highlightOpinion(text);

    // Detect fallacies
    const fallaciesFound = await detectFallacies(text);

    // Render highlights
    article.innerHTML = highlighted;

    // Attach fallacy tooltips
    fallaciesFound.forEach(fallacy => {
      const element = document.createElement('span');
      element.className = 'fallacy-indicator';
      element.textContent = '⚠';
      element.title = fallacy.name;

      element.addEventListener('mouseenter', (e) => {
        const tooltip = createFallacyTooltip(fallacy.id);
        const rect = e.target.getBoundingClientRect();
        const tooltipEl = document.createElement('div');
        tooltipEl.innerHTML = tooltip;
        document.body.appendChild(tooltipEl);
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.left = rect.left + 'px';
        tooltipEl.style.top = (rect.top - 50) + 'px';
        tooltipEl.style.zIndex = '10000';
      });

      element.addEventListener('mouseleave', () => {
        document.querySelectorAll('.fallacy-tooltip').forEach(t => t.remove());
      });

      article.appendChild(element);
    });
  }

  // Initialize
  async function init() {
    await loadFallacies();
    await loadState();

    // Listen for state changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.settings) {
        state = { ...state, ...changes.settings.newValue };
      }
    });

    // Process current page
    processPage();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

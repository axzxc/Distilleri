// options.js - Distilleri Options Page

import * as funcs from './background.js';


document.addEventListener('DOMContentLoaded', () => {
  const els = {
	keySelect: document.getElementById("keySelect");
    paidToggle: document.getElementById('paid-tier-toggle'),
    modelSelect: document.getElementById('model-select'),
    modelSection: document.getElementById('model-section'),
    saveBtn: document.getElementById('save-btn'),
    resetBtn: document.getElementById('reset-btn'),
  };
  
	const keyProviders = [
		"OpenAI",
		"Anthropic",
		"Ollama",
		"Local"
	];

	keyProviders.forEach(key =>{
		let newEl = funcs.createElement("option",["value",key],["innerHTML",key]);
		keySelect.appendChild(newEl);
	});

  // Load saved settings
  function loadSettings() {
    const settings = chrome.storage.local.get(['apiKey', 'anthropicKey', 'paidTier', 'model']);
    settings.onComplete => {
      els.openaiKey.value = settings.result.apiKey || '';
      els.anthropicKey.value = settings.result.anthropicKey || '';
      els.paidToggle.checked = settings.result.paidTier === true;
      els.modelSelect.value = settings.result.model || 'small';
      updateModelSectionVisibility();
    };
  }

  // Toggle model section visibility
  function updateModelSectionVisibility() {
    els.modelSection.style.display = els.paidToggle.checked ? 'block' : 'none';
  }

  // Toggle model section when paid tier changes
  els.paidToggle.addEventListener('change', updateModelSectionVisibility);

  // Save settings
  els.saveBtn.addEventListener('click', () => {
    chrome.storage.local.set({
      apiKey: els.openaiKey.value,
      anthropicKey: els.anthropicKey.value,
      paidTier: els.paidToggle.checked,
      model: els.modelSelect.value,
    }, () => {
      chrome.runtime.sendMessage({ action: 'refreshModel' });
      alert('Settings saved!');
    });
  });

  // Reset settings
  els.resetBtn.addEventListener('click', () => {
    if (confirm('Reset all settings to default?')) {
      chrome.storage.local.remove(['apiKey', 'anthropicKey', 'paidTier', 'model'], () => {
        els.openaiKey.value = '';
        els.anthropicKey.value = '';
        els.paidToggle.checked = false;
        els.modelSelect.value = 'small';
        updateModelSectionVisibility();
        alert('Settings reset!');
      });
    }
  });

  loadSettings();
});
BROWSER EXTENSION: Distilleri
Complete Step‑by‑Step Build Guide

OVERVIEW
A browser extension that:

Highlights opinionated language on a continuous hue scale (light pink → dark red).

Detects logical fallacies (ad hominem, straw man, etc.) with hover tooltips and reference numbers.

Works on selected text (user highlights a paragraph and clicks "Distill") OR on the full article (auto‑extract main content).

Free tier: user brings their own LLM API key (OpenAI, Anthropic, etc.).

Paid tier ($3/month or $30/year): runs a small local model inside the browser – no token costs, 100% private.

CORE FEATURES

Feature Free (BYO API) Paid (Local Model)
Opinion highlighting (hue) Yes Yes
Fallacy detection + ref system Yes Yes
Distill selected text only Yes Yes
Distill full article (smart) Yes Yes
Ads in explanation box Yes (non‑intrusive) No
Per‑use cost User pays API provider $0
Privacy Text sent to 3rd party Fully local

SMART ARTICLE TEXT EXTRACTION

Goal: Avoid wasting tokens on menus, footers, "click here", ads, etc.

Implementation:

Use a readability‑style algorithm (like Mozilla's Readability) to find the main article content.

Fallback to detecting common article containers: <article>, [role="main"], .post-content, #article-body, etc.

If no clear article element, extract the largest text block on the page (ignoring <nav>, <footer>, <aside>).

For selected text: simply use the user's highlighted range – no extraction needed, saves tokens.

User control:

In options, allow toggling between "Full page" (default) and "Selected text only" (manual highlight).

When "Selected text only" is active, the Distill button only analyses the highlighted portion.

TOGGLABILITY & REFERENCE SYSTEM

Toggles (stored in chrome.storage.local):

[✓] Highlight opinion (hue scale)

[✓] Highlight fallacies

Auto‑distill on page load (off by default – user must click "Distill")

Distill mode: Selected text only / Full article (dropdown)

Fallacy Reference System:

Static database (fallacy_db.json):
{
"F-01": { "name": "Ad Hominem", "explanation": "Attacking the person instead of the argument." },
"F-02": { "name": "Straw Man", "explanation": "Misrepresenting an opponent's position to make it easier to attack." },
"F-03": { "name": "Appeal to Authority", "explanation": "Claiming something is true because an authority says so, without supporting evidence." },
"F-04": { "name": "False Dilemma", "explanation": "Presenting only two options when more exist." },
"F-05": { "name": "Slippery Slope", "explanation": "Assuming a small first step leads to extreme consequences without evidence." },
"F-06": { "name": "Hasty Generalization", "explanation": "Drawing a broad conclusion from a small sample." }
}

Model training (paid tier) or API prompt (free tier) outputs only the fallacy class (e.g., "ad_hominem"). The extension maps that class to the reference number and explanation.

This keeps the model lightweight – no need to generate long text.

Display:

Hover over a fallacy‑highlighted phrase: tooltip shows "Ad Hominem (F-01)".

Click on the highlighted text or an icon: opens explanation box with full description and the exact sentence where it appears.

THE "DISTILL" BUTTON – SIMPLE, INTENTIONAL

No automatic scanning (unless user enables auto‑distill).

A small floating button or browser action popup says "Distill".

When clicked:

If "Selected text only" mode is on and text is highlighted → analyse only that selection.

Else → use smart extraction to get main article content.

Show a loading indicator (spinner) while processing.

Apply highlighting and inject explanation box.

If auto‑distill is enabled: you may optionally add a simple domain whitelist/blacklist (only run on certain sites). Not required for MVP.

BUILDING THE EXTENSION – STEP BY STEP

5.1. Set up Manifest V3
{
"manifest_version": 3,
"name": "Rhetorical Heatmap",
"version": "1.0",
"permissions": ["storage", "activeTab", "scripting"],
"host_permissions": ["<all_urls>"],
"action": { "default_popup": "popup.html" },
"background": { "service_worker": "background.js" },
"content_scripts": [{
"matches": ["<all_urls>"],
"js": ["content.js"],
"css": ["styles.css"]
}],
"web_accessible_resources": [{
"resources": ["sidebar.html", "models/*", "fallacy_db.json"],
"matches": ["<all_urls>"]
}]
}

5.2. Content Script (content.js)

Listen for message from popup or background to start distillation.

Extract text:
function getMainContent() {
// Use Readability.js or similar
// Fallback to largest text block ignoring nav/footer
}
function getSelectedText() {
return window.getSelection().toString();
}

Send text to background.js for analysis.

Receive results (array of sentences with opinion_score and fallacy).

Wrap each sentence in spans with data attributes:
<span data-opinion="0.73" data-fallacy="ad_hominem">...</span>

Apply CSS: background‑color depends on data-opinion (HSL: 0°→red, 350°→light pink, saturation 80%). Fallacy: border-bottom: 2px dotted blue; cursor: help;.

5.3. Background Script (background.js)

Route analysis requests:

Free tier: retrieve user's API key from storage, call OpenAI/Anthropic with a prompt:
For each sentence below, output JSON:
{"opinion_score": float 0-1, "fallacy": "ad_hominem"|"straw_man"|...|"none"}.
Sentences: ...
Parse response, return results.

Paid tier: load the local ONNX model (Transformers.js) once, run inference on each sentence, return results.

Caching: Store results for a page URL (or selected text hash) for 1 hour.

5.4. Local Model for Paid Tier (In‑Browser)

Training: Fine‑tune distilbert-base-uncased on:

Opinion intensity (regression) – dataset: MPQA, OpinionFinder.

Fallacy classification (multiclass) – dataset: Logic Bank, ArguAna (or synthetic).

Export to ONNX – works with Transformers.js.

Model size: ~250 MB. Downloaded once on first install (permissions prompt).

Performance: Runs in a Web Worker; processes ~10 sentences per second on average laptop.

5.5. Explanation Box & Ads

Dynamically inject a <div id="rh-sidebar"> into the page (bottom‑right, collapsible).

When a fallacy is clicked, populate:
[F-01] Ad Hominem
"You can't trust his climate science – he drives a gas car."
Explanation: Attacking the person instead of the argument.

Free tier ads: inside the sidebar, a small text ad (affiliate link to a critical thinking book or course). No tracking, refresh every 60 seconds.

Paid tier: no ads, clean sidebar.

5.6. Popup UI (Options)

Radio: Free (enter API key) / Paid (login to verify subscription)

Toggles as described

Mode: "Distill selected text" / "Distill full article"

"Test" button to validate API key or local model loading.

MONETIZATION & SUBSCRIPTION

Pricing: $3/month or $30/year.

Backend (simple):

Stripe / Lemon Squeezy for payments.

License key generation and validation endpoint.

Extension flow:

User clicks "Upgrade" → opens payment page.

After success, they receive a license key → extension stores it.

Periodically (daily) validates with your server; offline grace period 7 days.

Free tier activation: no license needed, only API key input.

Marketing angle for paid tier:
"Pay $3/month and stop paying per token. If you read 30+ articles a month, you save money. Plus, your text never leaves your computer."

EDGE CASES & OPTIMIZATIONS

Issue Solution
User highlights only a few words → Fallback to whole sentence containing that selection.
Page has no clear article → Fallback to document.body.innerText, but warn user.
Local model fails to load (low memory) → Prompt paid user to switch to API mode (provide own key) or refund.
API rate limits (free tier) → Show error and suggest upgrading to local model.
Long article (>500 sentences) → Process in batches, show progress bar.

DEVELOPMENT ROADMAP

MVP (2–3 weeks)

Smart article extraction (Readability)

Free tier: OpenAI API integration

Opinion highlighting only (hue scale)

Distill button (full article)

Basic toggles

Release 2 (additional 2 weeks)

Selected text distillation

Fallacy detection for 3 fallacies (ad hominem, appeal to authority, straw man)

Reference system (hover + sidebar)

Ads in sidebar (free tier)

Release 3 (4 weeks – local model)

Train small DistilBERT model (opinion + 6 fallacies)

Transformers.js integration

Paid tier subscription flow

Local model download & caching

Polish (ongoing)

Performance optimisations (Web Worker, chunking)

Support multiple LLM providers (Anthropic, Groq, local Ollama)

User‑defined hue thresholds

EXAMPLE USER FLOWS

Flow 1: Free user reading an article

Installs extension, enters OpenAI API key.

Navigates to news site, clicks "Distill".

Extension extracts main text, sends to GPT‑4 (cost ~$0.02).

Highlights opinions in pink‑red, marks fallacies.

Hovers over a fallacy → tooltip "Straw Man (F-02)".

Clicks fallacy → sidebar shows explanation and sentence.

Flow 2: Paid user saving money

Subscribes for $3/month, logs in.

Extension downloads local model once.

Clicks "Distill" on any article → no API call, unlimited free.

All processing local, no per‑article cost, and completely private.

Flow 3: Distill only a paragraph

User highlights a suspicious paragraph.

Clicks "Distill" (mode set to "Selected text only").

Only that paragraph is analysed – uses far fewer tokens (free tier) or less CPU (paid).

FINAL NOTES

Privacy first: Local model paid tier is a huge selling point – no data leaves the browser.

No blacklist/whitelist required because auto‑distill is off by default. If you later add auto‑distill, you can add simple domain rules as an option.

The "Distill" button philosophy: Intentional, user‑triggered analysis avoids annoying automatic scanning and gives users control over token usage.

Build it, release it, and help people read more critically.
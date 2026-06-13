Distilleri

Distilleri is a browser extension that helps you read critically by visualizing opinionated language and identifying logical fallacies in any article. It doesn't tell you what to think – it shows you how the text is trying to make you think.

"Distill opinion from fact."


Features

- Opinion heatmap – rhetorical intensity mapped to a hue scale (light pink to dark red).
- Fallacy detection – highlights common logical fallacies (ad hominem, straw man, false dilemma, etc.) with hover tooltips and a reference system.
- Two distillation modes – analyze a full article (smart extraction) or only a selected passage.
- Toggles – turn opinion highlights, fallacy detection, and auto-distill on/off.
- Privacy-first – free tier uses your own API key; paid tier runs a local model – no data leaves your device.
- Fair monetization – free tier (ads + your API key) or $3/month (ad-free + local model, unlimited use).


How It Works

1. Install the extension from the Chrome Web Store.
2. Click the Distilleri button on any article, or highlight text, right-click, and choose "Distill selection".
3. The text is analyzed for opinion intensity and fallacies.
4. Opinionated phrases get a background hue (darker = stronger opinion).
5. Fallacies are underlined – hover for name, click for full explanation.
6. Upgrade to the paid tier for unlimited, private, local-model analysis (no API key needed).


Free vs. Paid

Feature                        Free                          Paid ($3/mo or $30/yr)
Opinion heatmap                Yes                           Yes
Fallacy detection              Yes                           Yes
Selection distillation         Yes                           Yes
Full-page distillation         Yes                           Yes
Ads in explanation box         Yes (non-intrusive)           No
AI backend                     Your own API key              Local model (Transformers.js)
                               (you pay per token)           (no token costs, private)
Privacy                        Text sent to your API         Text never leaves browser

Why pay? If you read more than about 20 articles per month, your API costs exceed $3. The paid tier saves you money and keeps everything local.


For Developers

Project Structure

distilleri-extension/
├── manifest.json          (Manifest V3)
├── popup.html / popup.js  (UI toggles & Distill button)
├── content.js             (extraction, highlighting, sidebar)
├── background.js          (API calls / local model inference)
├── sidebar.html / sidebar.js (fallacy explanations + ads)
├── models/                (local ONNX model for paid tier)
├── fallacy_db.json        (static fallacy reference)
├── icons/
└── README.md

Build the Local Model (Paid Tier)

Fine-tune DistilBERT (66M params) for multi-task classification:
- Opinion intensity: regression (0.0 to 1.0)
- Fallacy type: one of 7 classes (including "none")

Training datasets: MPQA, OpinionFinder, Logic Bank, ArguAna.
Export to ONNX for use with Transformers.js.

Run Locally (Development)

1. Clone the repo.
2. Open chrome://extensions/.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the extension folder.
5. For free tier: add your OpenAI/Anthropic API key in the popup.
6. For paid tier: download the local model (first run) – all processing stays in-browser.

Permissions Required

- activeTab – only runs on the page you click.
- storage – for user preferences and API keys (encrypted).
- contextMenus – for selection distillation.
- Host permissions not requested by default (except user-supplied API endpoints).


Fallacy Reference System

The extension includes a built-in fallacy database (fallacy_db.json). Example entry:

"F-01": {
  "name": "Ad Hominem",
  "explanation": "Attacking the person instead of the argument. The source's character does not affect the truth of their claim."
}

When the model detects a fallacy, it returns the class label (e.g., "ad_hominem") and the extension maps it to F-01 for display.


Roadmap

- [ ] MVP: free tier + opinion heatmap only
- [ ] Add fallacy detection (5 most common)
- [ ] Implement selection distillation
- [ ] Train and ship local model for paid tier
- [ ] Sidebar explanations with clickable references
- [ ] Auto-distill (optional, user-controlled)


License

AGPL-3.0 – open source, but any derivative work must also be open source.


Credits

Built with Transformers.js, Readability.js. Inspired by media literacy and critical thinking movements.


FAQ

Q: Does Distilleri "fact-check"?
A: No. It highlights opinion and fallacies – it never says "this is false". You remain the judge.

Q: Is my text safe?
A: Free tier sends text to your own API key. Paid tier processes everything locally. We never see your data.

Q: What if I don't have an API key?
A: Use the paid tier ($3/month) or sign up for OpenAI/Anthropic – they offer free trial credits.

Q: Can I contribute?
A: Yes! Open an issue or pull request on GitHub (repo link TBD).

Distilleri – read between the lines.
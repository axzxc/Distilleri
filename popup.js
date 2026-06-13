const toggles = [
        { id: 'toggle-opinion', key: 'opinionHighlight' },
        { id: 'toggle-fallacy', key: 'fallacyDetection' },
        { id: 'toggle-auto', key: 'autoDistill' },
        { id: 'toggle-tooltip', key: 'selectionTooltip' }
      ];

      async function loadState() {
        const stored = await chrome.storage.local.get(['settings']);
        if (stored.settings) {
          /*toggles.forEach(t => {
            const el = document.getElementById(t.id);
            const icon = el.querySelector('.toggle-icon');
            if (stored.settings[t.key]) {
              icon.textContent = '✅';
            } else {
              icon.textContent = '⭕';
            }
          });*/
        }
		const B64Icons = await chrome.storage.local.get(['icons/base64.js']);
		console.log(B64Icons);
      }

      function updateState() {
        /*toggles.forEach(t => {
          const el = document.getElementById(t.id);
          const icon = el.querySelector('.toggle-icon');
          const enabled = icon.textContent === '✅';
          chrome.storage.local.set({
            settings: {
              opinionHighlight: enabled,
              fallacyDetection: enabled,
              autoDistill: enabled,
              selectionTooltip: enabled
            }
          });
        });*/
      }

      /*toggles.forEach(t => {
        const el = document.getElementById(t.id);
        const icon = el.querySelector('.toggle-icon');
        el.addEventListener('click', () => {
          icon.textContent = icon.textContent === '⭕' ? '✅' : '⭕';
          updateState();
        });
      });*/

      document.getElementById('settingsButt').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
      });

      loadState();
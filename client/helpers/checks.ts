/**
 * © 2022-2022 Burns Recording Company
 * Created: 24/10/2022
 */

import { errorPage } from '../constants';

function checkForAudioContext(): void {
  if (typeof AudioContext === 'undefined') {
    // also check for the webkit shim for older versions of safari
    if ('webkitAudioContext' in window) {
      return;
    }

    throw new Error('Browser does not support AudioContext');
  }
}

export function runCompatibilityCheck(): void {
  try {
    checkForAudioContext();
  } catch(error) {
    const main = document.createElement('main');
    main.innerHTML = `
    <h1>${errorPage.title}</h1>
    <div class="message">
    ${
      errorPage.message.map(line => (
        `<p>${line}</p>`
      )).join('\n')
    }
    </div>
    ${
      errorPage.showErrorDetails
      ? `<pre>ERROR NAME:\n${error.name}\nMESSAGE:\n${error.message}\nSTACK:\n${error.stack}</pre>`
      : ''
      }
    `;
    document.body.replaceChildren(main);
  }
}

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
      ? `<textarea>ERROR NAME:\n${error.name}\nMESSAGE:\n${error.message}\nSTACK:\n${error.stack}</textarea>`
      : ''
      }
    `;
    document.body.replaceChildren(main);
  }
}

export const isSafari = () => {
  return navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
  navigator.userAgent &&
  navigator.userAgent.indexOf('CriOS') == -1 &&
  navigator.userAgent.indexOf('FxiOS') == -1;
};

export const isIos = () => navigator.userAgent.match(/ipad|iphone/i);

export const copyText = async (text: string) => {
  const copied = () => alert('Copied share link to clipboard');

  if (isIos()) {
    return prompt('Copy the shareable link below:', text);
  }

  await navigator.clipboard.writeText('');
  await navigator.clipboard.writeText(text);
  console.log(await navigator.clipboard.readText())
  return copied();
}

/**
 * © 2022-2022 Burns Recording Company
 * Created: 24/10/2022
 */

import { errorPage } from '../constants';

/**
 * Detects if the user's browser supports the AudioContextAPI
 * which is required for the {@link Player} and {@link Scope} to function.
 */
function checkForAudioContext(): void {
  if (typeof AudioContext === 'undefined') {
    // also check for the webkit shim for older versions of safari
    if ('webkitAudioContext' in window) {
      return;
    }

    throw new Error('Browser does not support AudioContext');
  }
}

/**
 * Checks that the user's browser can run the player. If not, it just draws an error page.
 * If you don't want it to take over the entire page, change the line that says
 * `document.body.replaceChildren(main);`
 * with
 * `document.body.appendChild(main);`
 * 
 * This will write the HTML that is generated below to the last position on the page.
 * If you want it to look different, just refer to the 'class' values and element types below
 * and edit their styles in the stylesheet files.
 * You can also change the HTML contents as you like.
 */
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

/**
 * Returns `true` if the user's browser is Safari
 */
export const isSafari = () => {
  return navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
  navigator.userAgent &&
  navigator.userAgent.indexOf('CriOS') == -1 &&
  navigator.userAgent.indexOf('FxiOS') == -1;
};

/**
 * Returns `true` if the user's browser is Chrome/Chromium
 */
export const isChrome = () => {
  return Boolean(navigator.userAgent.match(/(C|c)hrom(e|ium)/i));
}

/**
 * Returns true if the user is on an iOS device.
 */
export const isIos = () => navigator.userAgent.match(/ipad|iphone/i);

/**
 * Returns `true` if the user is on a mobile device, detected by the presence
 * of touch events.
 */
export const isMobile = (): boolean => 'ontouchstart' in document.documentElement;

/**
 * Copies text to a user's clipboard using the Clipboard API. If the
 * user is on an iOS device, it will display a prompt containing the text
 * for the user to copy themselves.
 * 
 * @note not all browsers support the Clipboard API
 * @param text The text to be copied
 * @param promptText A little helper text to inform the user
 */
export const copyText = async (text: string, promptText = 'Copy the text below:') => {
  const copied = () => alert('Copied share link to clipboard');

  if (isIos()) {
    return prompt(promptText, text);
  }

  await navigator.clipboard.writeText('');
  await navigator.clipboard.writeText(text);
  return copied();
}

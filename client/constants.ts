/**
 * © 2022-2022 Burns Recording Company
 * Created: 24/10/2022
 */

/**
 * This are the error messages for use when a major error has a occurred that will
 * prevent the player/page from being loaded.
 * 
 * You can see where these are used here: `/client/helpers/checks.ts`
 * 
 * Note: If the user doesn't have JavaScript enabled, there will be a different error
 * displayed. You can find that in `/views/includes/no-script.ejs`
 */
export const errorPage = {
  title: 'Oops!',
  message: [
    `Your web browser isn't compatible with PL-10.`,
    `Learn more about the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API">Web Audio API</a>`,
    `<em>And</em> see if your browser can use it: <a href="https://caniuse.com/?search=AudioContext">check my browser</a>.`,
  ],
  showErrorDetails: false,
} as const;

export const UUID_REGEX = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

export const PL_10_SETTINGS_KEY = 'pl-10-settings';
export const PL_10_DEFAULT_SETTINGS = {
  oscilloscope: {
    visible: true
  },
  volume: {
    visible: true, // not implemented
    default: 0.5, // not implemented
  }
};

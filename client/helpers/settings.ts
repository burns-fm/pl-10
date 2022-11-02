/**
 * © 2022-2022 Burns Recording Company
 * Created: 01/11/2022
 */
import { PL_10_DEFAULT_SETTINGS, PL_10_SETTINGS_KEY } from "../constants";
import { SessionStore } from './session-store';

const pathDelimiter = '.';

export type PlayerSettings = typeof PL_10_DEFAULT_SETTINGS;
type PlayerSettingsKey = keyof typeof PL_10_DEFAULT_SETTINGS;
type PlayerSettingsItemKey = keyof typeof PL_10_DEFAULT_SETTINGS[PlayerSettingsKey];
type PlayerSettingsItemValue = typeof PL_10_DEFAULT_SETTINGS[PlayerSettingsKey][PlayerSettingsItemKey];

export class Settings {
  private _store = window.localStorage;

  constructor() {
    if (!this._store || !window.localStorage) {
      console.warn(`Your browser does not support the method PL-10 uses to store your settings. Your settings will only be saved for as long as this browser window remains open.`);
      this._store = new SessionStore();
    }
  }

  get(path: string): PlayerSettings[PlayerSettingsKey] | PlayerSettingsItemValue {
    const settings = this.getAll();
    const [component, setting] = this.parsePath(path);
    if (!setting) {
      return settings[component];
    }
    return settings[component][setting];
  }

  set(path: string, value: PlayerSettingsItemValue): void {
    const settings = this.getAll();
    const [component, setting] = this.parsePath(path);
    const current = settings[component][setting];

    if (typeof current !== typeof value) {
      throw new TypeError(`New setting is an invalid type: ${typeof value}.`);
    }

    settings[component][setting] = value;
    this._store.setItem(PL_10_SETTINGS_KEY, JSON.stringify(settings));
  }

  getAll(): PlayerSettings {
    try {
      const settings = this._store.getItem(PL_10_SETTINGS_KEY);

      if (!settings) {
        return this.resetToDefault();
      }

      return JSON.parse(settings);
    } catch(e) {
      console.error(`There was an error loading the settings saved in local browser storage. Resetting to defaults.`);
      return this.resetToDefault();
    }
  }

  resetToDefault() {
    this._store.setItem(PL_10_SETTINGS_KEY, JSON.stringify(PL_10_DEFAULT_SETTINGS));
    return PL_10_DEFAULT_SETTINGS;
  }

  private parsePath(path: string): [PlayerSettingsKey, PlayerSettingsItemKey] {
    const [key, settingsKey] = path.split(pathDelimiter);
    return [key as PlayerSettingsKey, settingsKey as PlayerSettingsItemKey];
  }
};

export const settings = new Settings();

/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */

import { createHash, randomBytes } from "crypto";

/**
 * A lightweight in-memory data store for managing simple sets of records.
 */
export class Store<T extends Record<string, any>> {
  static KEY_LENGTH = 16;
  static KEY_ENCODING = 'hex' as const;

  private readonly _data: Map<string, T> = new Map();

  /**
   * Give the store a reference name and optionally load some existing data into it by passing it an
   * array of data.
   * @param name 
   * @param data 
   */
  constructor(readonly name: string, data?: T[]) {
    this.loadData(data);
  }

  /**
   * Get the current number of entries in the store.
   */
  public get size(): number {
    return this._data.size;
  }

  /**
   * Get a list of the available keys in the store
   */
  public get keys(): string[] {
    return [...this._data.keys()];
  }

  /**
   * Get a specific entry from the store by the key.
   */
  public get(key: string): T | undefined {
    return this._data.get(key);
  }

  /**
   * Load an item into the store. Optionally give a value to seed the key generator.
   */
  public loadDataItem(item: T, keySeed?: string): string {
    const key = this.generateKey(`${keySeed ?? JSON.stringify(item)}`);
    this._data.set(key, item);
    return key;
  }

  /**
   * Empty all of the contents of the data store.
   */
  public reset(): boolean {
    try {
      this._data.clear();
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  /**
   * Load an array of data to the store. Uses the {@link Store.loadDataItem} function.
   */
  private loadData(data?: T[]): void {
    if (!data || data.length === 0) return;

    for (const dataEntry of data) {
      this.loadDataItem(dataEntry);
    }
  }

  /**
   * Generates a pseudo-random key in the set format (default: hexadecimal)
   */
  public generateRandomKey(): string {
    return randomBytes(Store.KEY_LENGTH).toString(Store.KEY_ENCODING);
  }

  /**
   * Generates a key by running an md5 hash on a passed seed string in the set format (default: hexadecimal)
   */
  private generateKey(data: string): string {
    return createHash('md5').update(data).digest(Store.KEY_ENCODING);
  }
}

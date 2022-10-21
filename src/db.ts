/**
 * © 2022-2022 Burns Recording Company
 * Created: 20/10/2022
 */

import { randomBytes } from "crypto";

export class Store<T> {
  static KEY_LENGTH = 16;
  static KEY_ENCODING: BufferEncoding = 'hex';

  private readonly _data: Map<string, T> = new Map();

  constructor(readonly name: string, data?: T[]) {
    this.loadData(data);
  }

  public get size(): number {
    return this._data.size;
  }

  public get keys(): string[] {
    return [...this._data.keys()];
  }

  public get(key: string): T | undefined {
    return this._data.get(key);
  }

  public loadDataItem(item: T): string {
    const key = this.generateKey();
    this._data.set(key, item);
    return key;
  }

  public reset(): boolean {
    try {
      this._data.clear();
      return true;
    } catch(e) {
      console.error(e);
      return false;
    }
  }

  private loadData(data?: T[]): void {
    if (!data || data.length === 0) return;

    for (const dataEntry of data) {
      this.loadDataItem(dataEntry);
    }
  }

  private generateKey(): string {
    return randomBytes(Store.KEY_LENGTH).toString(Store.KEY_ENCODING);
  }
}

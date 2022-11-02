/**
 * © 2022-2022 Burns Recording Company
 * Created: 01/11/2022
 */

/**
 * A basic in-memory store as a shim for missing or disabled 'localStorage'. It's just an interface over a `Map`.
 * 
 * Why? Because it kept it cleaner than writing additional logic within the settings and player
 * to manage unavailability of storage—an edge case anyway.
 * 
 * 
 */
export class SessionStore implements Storage {
  private _data: Map<string, string> = new Map();

  setItem(key: string, value: string): void {
    this._data.set(key, value);
  }

  getItem(key: string): string | null {
    return this._data.get(key) || null;
  }

  removeItem(key: string): void {
    this._data.delete(key);
  }

  clear() {
    this._data.clear();
  }

  key(index: number) {
    return this._data.keys()[index];
  }

  get length(): number {
    return this._data.size;
  }
}

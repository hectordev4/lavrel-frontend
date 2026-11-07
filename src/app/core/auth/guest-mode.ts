import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'lavrel.browsing-without-account';

/**
 * Remembers that someone chose "Skip for now" on the welcome page, so the next visit opens
 * the app instead of the welcome page. Stored in this browser only.
 */
@Injectable({ providedIn: 'root' })
export class GuestMode {
  private readonly _active = signal(read());

  readonly active = this._active.asReadonly();

  enable(): void {
    write(true);
    this._active.set(true);
  }

  clear(): void {
    write(false);
    this._active.set(false);
  }
}

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function write(value: boolean): void {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, 'true');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or storage disabled: the choice just isn't remembered.
  }
}

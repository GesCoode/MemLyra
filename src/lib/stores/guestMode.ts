import { get, writable } from 'svelte/store';

/** True while the user is practicing without an account (local storage only). */
export const guestMode = writable(false);

export function isGuestMode(): boolean {
  return get(guestMode);
}

export function setGuestMode(active: boolean): void {
  guestMode.set(active);
}

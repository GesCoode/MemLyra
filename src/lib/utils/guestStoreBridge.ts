import { isGuestMode } from '$lib/stores/guestMode';
import { persistGuestData } from '$lib/utils/guestSync';
import { readGuestData, type GuestData } from '$lib/utils/guestStorage';

export function guestActive(): boolean {
  return isGuestMode();
}

export function runGuestMutation(mutator: (data: GuestData) => GuestData): GuestData {
  const next = mutator(readGuestData());
  persistGuestData(next);
  return next;
}

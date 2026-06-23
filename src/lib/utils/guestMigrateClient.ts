import { browser } from '$app/environment';
import { clearGuestData, hasGuestDataToMigrate, readGuestData, stripGuestStarterPreset } from '$lib/utils/guestStorage';
import { setGuestMode } from '$lib/stores/guestMode';

export async function migrateGuestDataIfPresent(): Promise<boolean> {
  if (!browser || !hasGuestDataToMigrate()) {
    if (browser) clearGuestData();
    return false;
  }

  const payload = stripGuestStarterPreset(readGuestData());

  try {
    const response = await fetch('/api/guest/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) return false;

    clearGuestData();
    setGuestMode(false);
    return true;
  } catch {
    return false;
  }
}

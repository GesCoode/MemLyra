import { writable } from 'svelte/store';

/** True while an exercise quiz is in progress (not setup or session report). */
export const exerciseSessionActive = writable(false);

import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';

const SESSION_KEY = 'memlyra-user';
const ACCOUNTS_KEY = 'memlyra-accounts';

export type User = {
  email: string;
  name: string;
  createdAt: string;
};

type StoredAccount = {
  email: string;
  name: string;
  createdAt?: string;
};

export const user = writable<User | null>(null);
export const isLoggedIn = derived(user, ($user) => $user !== null);

function nowIso(): string {
  return new Date().toISOString();
}

function saveSession(session: User) {
  if (browser) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function normalizeAccount(account: StoredAccount): StoredAccount {
  return {
    ...account,
    createdAt: account.createdAt ?? nowIso()
  };
}

function loadAccounts(): StoredAccount[] {
  if (!browser) return [];

  const stored = localStorage.getItem(ACCOUNTS_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as StoredAccount[];
    const normalized = parsed.map(normalizeAccount);
    if (normalized.some((account, index) => !parsed[index]?.createdAt)) {
      saveAccounts(normalized);
    }
    return normalized;
  } catch {
    localStorage.removeItem(ACCOUNTS_KEY);
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  if (browser) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function findAccount(email: string): StoredAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return loadAccounts().find((account) => account.email.toLowerCase() === normalized);
}

function fallbackName(email: string): string {
  const localPart = email.trim().split('@')[0];
  return localPart || 'Account';
}

function toUser(account: StoredAccount): User {
  const normalized = normalizeAccount(account);
  return {
    email: normalized.email,
    name: normalized.name,
    createdAt: normalized.createdAt!
  };
}

function normalizeUser(raw: Partial<User> & { email: string }): User {
  const email = raw.email.trim();
  const account = findAccount(email);

  if (account) {
    return toUser(account);
  }

  return {
    email,
    name: raw.name?.trim() || fallbackName(email),
    createdAt: raw.createdAt ?? nowIso()
  };
}

function ensureAccount(session: User) {
  if (findAccount(session.email)) return;

  saveAccounts([
    ...loadAccounts(),
    { email: session.email, name: session.name, createdAt: session.createdAt }
  ]);
}

export function initAuth() {
  if (!browser) return;

  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return;

  try {
    const parsed = JSON.parse(stored) as Partial<User> & { email: string };
    const session = normalizeUser(parsed);
    ensureAccount(session);
    user.set(session);
    saveSession(session);
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function register(email: string, name: string): boolean {
  const trimmedEmail = email.trim();
  const trimmedName = name.trim();

  if (!trimmedEmail || !trimmedName) return false;

  const accounts = loadAccounts();
  const normalized = trimmedEmail.toLowerCase();

  if (accounts.some((account) => account.email.toLowerCase() === normalized)) {
    return false;
  }

  const createdAt = nowIso();
  const account: StoredAccount = { email: trimmedEmail, name: trimmedName, createdAt };
  saveAccounts([...accounts, account]);

  const session: User = { email: trimmedEmail, name: trimmedName, createdAt };
  saveSession(session);
  user.set(session);
  return true;
}

export function signIn(email: string): boolean {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return false;

  const account = findAccount(trimmedEmail);
  if (!account) return false;

  const session = toUser(account);
  saveSession(session);
  user.set(session);
  return true;
}

export function signOut() {
  if (browser) localStorage.removeItem(SESSION_KEY);
  user.set(null);
}

export function updateProfile(name: string): boolean {
  const trimmedName = name.trim();
  if (!trimmedName) return false;

  let updated = false;

  user.update((current) => {
    if (!current) return current;

    const session: User = { ...current, name: trimmedName };
    saveSession(session);

    const accounts = loadAccounts().map((account) =>
      account.email.toLowerCase() === session.email.toLowerCase()
        ? { ...account, name: trimmedName }
        : account
    );
    saveAccounts(accounts);
    updated = true;
    return session;
  });

  return updated;
}

export function deleteCurrentAccount(): boolean {
  let removed = false;

  user.update((current) => {
    if (!current) return current;

    const accounts = loadAccounts().filter(
      (account) => account.email.toLowerCase() !== current.email.toLowerCase()
    );
    saveAccounts(accounts);
    removed = true;
    return current;
  });

  if (!removed || !browser) return false;

  localStorage.removeItem(SESSION_KEY);
  user.set(null);
  return true;
}

export function getAccountStartDate(currentUser: User | null): Date {
  if (!currentUser?.createdAt) return new Date();
  return new Date(currentUser.createdAt);
}

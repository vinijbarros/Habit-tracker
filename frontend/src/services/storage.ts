const AUTH_STORAGE_KEY = 'habit-tracker-auth';
const AUTH_NOTICE_STORAGE_KEY = 'habit-tracker-auth-notice';

export interface StoredAuth {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function loadStoredAuth(): StoredAuth | null {
  const value = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredAuth;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveStoredAuth(data: StoredAuth): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function saveAuthNotice(message: string): void {
  sessionStorage.setItem(AUTH_NOTICE_STORAGE_KEY, message);
}

export function consumeAuthNotice(): string | null {
  const message = sessionStorage.getItem(AUTH_NOTICE_STORAGE_KEY);

  if (!message) {
    return null;
  }

  sessionStorage.removeItem(AUTH_NOTICE_STORAGE_KEY);
  return message;
}

const AUTH_STORAGE_KEY = 'habit-tracker-auth';

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

const STORAGE_KEY = 'detective-ia-gemini-key';

export function getStoredApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredApiKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {}
}

export function hasApiKey() {
  return getStoredApiKey().length > 0;
}

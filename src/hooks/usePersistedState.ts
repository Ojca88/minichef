import { useEffect, useRef, useState } from 'react';

const PREFIX = 'baby-food-app:';

function readStorage<T>(key: string, fallback: T | (() => T)): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback instanceof Function ? fallback() : fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback instanceof Function ? fallback() : fallback;
  }
}

/** useState backed by localStorage, keyed and namespaced for this app. */
export function usePersistedState<T>(key: string, fallback: T | (() => T)) {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback));
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode / quota) — state stays in memory only
    }
  }, [key, value]);

  return [value, setValue] as const;
}

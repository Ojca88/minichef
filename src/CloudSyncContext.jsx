import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const CODE_KEY = 'minichef:household-code';
const LOCAL_FALLBACK_KEY = 'minichef:local-data';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin caracteres ambiguos (0/O, 1/I...)

function randomCode() {
  let code = '';
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

function getStoredCode() {
  try { return localStorage.getItem(CODE_KEY) || null; } catch { return null; }
}

function setStoredCode(code) {
  try {
    if (code) localStorage.setItem(CODE_KEY, code);
    else localStorage.removeItem(CODE_KEY);
  } catch { /* localStorage no disponible: se ignora */ }
}

function readLocalFallback() {
  try {
    const raw = localStorage.getItem(LOCAL_FALLBACK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeLocalFallback(data) {
  try { localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(data)); } catch { /* no-op */ }
}

const CloudSyncContext = createContext(null);

export function CloudSyncProvider({ children }) {
  const [code, setCode] = useState(getStoredCode);
  const [data, setData] = useState(readLocalFallback);
  // status: 'offline' (sin Supabase configurado), 'no-code' (configurado pero sin código
  // todavía), 'loading', 'synced', 'error'
  const [status, setStatus] = useState(isSupabaseConfigured ? 'loading' : 'offline');
  const channelRef = useRef(null);

  useEffect(() => {
    if (!isSupabaseConfigured) { setStatus('offline'); return undefined; }
    if (!code) { setStatus('no-code'); return undefined; }

    let cancelled = false;
    setStatus('loading');

    supabase.from('households').select('data').eq('code', code).maybeSingle()
      .then(({ data: row, error }) => {
        if (cancelled) return;
        if (error) { setStatus('error'); return; }
        if (row) {
          setData(row.data || {});
          writeLocalFallback(row.data || {});
        }
        setStatus('synced');
      });

    const channel = supabase
      .channel(`household:${code}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'households', filter: `code=eq.${code}` }, (payload) => {
        setData(payload.new.data || {});
        writeLocalFallback(payload.new.data || {});
      })
      .subscribe();
    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [code]);

  const save = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      writeLocalFallback(next);
      if (isSupabaseConfigured && code) {
        supabase.from('households')
          .upsert({ code, data: next, updated_at: new Date().toISOString() })
          .then(({ error }) => setStatus(error ? 'error' : 'synced'));
      }
      return next;
    });
  }, [code]);

  const createHousehold = useCallback(async () => {
    const newCode = randomCode();
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('households').insert({ code: newCode, data });
      if (error) { setStatus('error'); return null; }
    }
    setStoredCode(newCode);
    setCode(newCode);
    return newCode;
  }, [data]);

  const joinHousehold = useCallback((inputCode) => {
    const clean = inputCode.trim().toUpperCase();
    if (!clean) return;
    setStoredCode(clean);
    setCode(clean);
  }, []);

  const leaveHousehold = useCallback(() => {
    setStoredCode(null);
    setCode(null);
  }, []);

  const value = { code, data, status, save, createHousehold, joinHousehold, leaveHousehold, isSupabaseConfigured };
  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>;
}

export function useCloud() {
  const ctx = useContext(CloudSyncContext);
  if (!ctx) throw new Error('useCloud debe usarse dentro de CloudSyncProvider');
  return ctx;
}

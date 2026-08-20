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

// A partir de la sesión de Supabase Auth, extrae { id, name, avatar, email }
// de la forma más robusta posible (Google no siempre rellena los mismos
// campos de user_metadata).
function profileFromSession(session) {
  if (!session?.user) return null;
  const u = session.user;
  const meta = u.user_metadata || {};
  return {
    id: u.id,
    name: meta.full_name || meta.name || u.email || 'Sin nombre',
    avatar: meta.avatar_url || meta.picture || null,
    email: u.email || null,
  };
}

const CloudSyncContext = createContext(null);

export function CloudSyncProvider({ children }) {
  const [code, setCode] = useState(getStoredCode);
  const [data, setData] = useState(readLocalFallback);
  // status: 'offline' (sin Supabase configurado), 'no-code' (configurado pero sin código
  // todavía), 'loading', 'synced', 'error'
  const [status, setStatus] = useState(isSupabaseConfigured ? 'loading' : 'offline');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const channelRef = useRef(null);

  // --- Sesión de Google / Supabase Auth ---------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthLoading(false); return undefined; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(profileFromSession(session));
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      const profile = profileFromSession(session);
      setUser(profile);
      if (event === 'SIGNED_IN' && profile) {
        await linkAccountToHousehold(profile);
      }
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Al iniciar sesión: si esta cuenta de Google ya estaba vinculada a un
  // hogar, se usa ese. Si no, y ya había un código activo en este
  // dispositivo (uso anónimo previo), se vincula ese código a la cuenta
  // para no perder los datos. Si tampoco había código, se crea un hogar
  // nuevo y se vincula directamente.
  async function linkAccountToHousehold(profile) {
    const { data: existingLink } = await supabase
      .from('user_households')
      .select('code')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (existingLink?.code) {
      setStoredCode(existingLink.code);
      setCode(existingLink.code);
      return;
    }

    const targetCode = code || randomCode();
    if (!code) {
      await supabase.from('households').insert({ code: targetCode, data }).select().maybeSingle();
    }
    await supabase.from('user_households').upsert({
      user_id: profile.id,
      code: targetCode,
      display_name: profile.name,
      avatar_url: profile.avatar,
    });
    setStoredCode(targetCode);
    setCode(targetCode);
  }

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setUser(null);
    // El código de hogar se queda tal cual: cerrar sesión de Google no te
    // saca de tu hogar, solo deja de identificarte como "tú" al marcar cosas.
  }, []);

  // --- Sincronización del hogar (código de 6 letras) ---------------------
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
      if (user) {
        await supabase.from('user_households').upsert({
          user_id: user.id, code: newCode, display_name: user.name, avatar_url: user.avatar,
        });
      }
    }
    setStoredCode(newCode);
    setCode(newCode);
    return newCode;
  }, [data, user]);

  const joinHousehold = useCallback(async (inputCode) => {
    const clean = inputCode.trim().toUpperCase();
    if (!clean) return;
    setStoredCode(clean);
    setCode(clean);
    if (isSupabaseConfigured && user) {
      await supabase.from('user_households').upsert({
        user_id: user.id, code: clean, display_name: user.name, avatar_url: user.avatar,
      });
    }
  }, [user]);

  const leaveHousehold = useCallback(() => {
    setStoredCode(null);
    setCode(null);
  }, []);

  const value = {
    code, data, status, save, createHousehold, joinHousehold, leaveHousehold, isSupabaseConfigured,
    user, authLoading, signInWithGoogle, signOut,
  };
  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>;
}

export function useCloud() {
  const ctx = useContext(CloudSyncContext);
  if (!ctx) throw new Error('useCloud debe usarse dentro de CloudSyncProvider');
  return ctx;
}

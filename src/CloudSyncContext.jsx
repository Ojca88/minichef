import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const LOCAL_FALLBACK_KEY = 'minichef:local-data';

function readLocalFallback() {
  try {
    const raw = localStorage.getItem(LOCAL_FALLBACK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeLocalFallback(data) {
  try { localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(data)); } catch { /* no-op */ }
}

// A partir de la sesión de Supabase Auth, extrae { id, name, avatar, email,
// isAnonymous } de la forma más robusta posible.
function profileFromSession(session) {
  if (!session?.user) return null;
  const u = session.user;
  const meta = u.user_metadata || {};
  return {
    id: u.id,
    name: meta.full_name || meta.name || u.email || 'Invitado',
    avatar: meta.avatar_url || meta.picture || null,
    email: u.email || null,
    isAnonymous: Boolean(u.is_anonymous),
  };
}

const CloudSyncContext = createContext(null);

export function CloudSyncProvider({ children }) {
  const [household, setHousehold] = useState(null); // { id, name, invite_code, data, ... } | null
  const [members, setMembers] = useState([]); // [{ user_id, role, profiles: {...} }]
  const [data, setData] = useState(readLocalFallback);
  // status: 'offline' | 'authenticating' | 'no-household' | 'loading' | 'synced' | 'error'
  const [status, setStatus] = useState(isSupabaseConfigured ? 'authenticating' : 'offline');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const channelRef = useRef(null);

  // --- Sesión: en cuanto la app arranca, si no hay sesión de ningún tipo,
  // creamos una sesión anónima real de Supabase. Así TODO el mundo tiene un
  // auth.uid() de verdad desde el primer segundo, y las políticas RLS
  // pueden aplicarse siempre igual, sin excepciones para "gente sin cuenta".
  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthLoading(false); return undefined; }

    async function ensureSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) { setStatus('error'); setAuthLoading(false); return; }
      }
      const { data: { session: finalSession } } = await supabase.auth.getSession();
      setUser(profileFromSession(finalSession));
      setAuthLoading(false);
    }
    ensureSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(profileFromSession(session));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // --- Cargar el hogar del usuario actual en cuanto sabemos quién es ------
  const loadHousehold = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return;
    setStatus('loading');
    const { data: h, error } = await supabase.rpc('my_household').maybeSingle();
    if (error) { setStatus('error'); return; }
    if (!h) { setHousehold(null); setStatus('no-household'); return; }
    setHousehold(h);
    setData(h.data || {});
    writeLocalFallback(h.data || {});
    setStatus('synced');
    loadMembers(h.id);
  }, [user]);

  async function loadMembers(householdId) {
    const { data: rows } = await supabase
      .from('household_members')
      .select('user_id, role, profiles(display_name, avatar_url)')
      .eq('household_id', householdId);
    setMembers(rows || []);
  }

  useEffect(() => { if (user) loadHousehold(); }, [user, loadHousehold]);

  // --- Suscripción en tiempo real a los cambios del hogar activo ----------
  useEffect(() => {
    if (!isSupabaseConfigured || !household?.id) return undefined;

    const channel = supabase
      .channel(`household:${household.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'households', filter: `id=eq.${household.id}` }, (payload) => {
        setData(payload.new.data || {});
        writeLocalFallback(payload.new.data || {});
      })
      .subscribe();
    channelRef.current = channel;

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [household?.id]);

  const save = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      writeLocalFallback(next);
      if (isSupabaseConfigured && household?.id) {
        supabase.from('households')
          .update({ data: next, updated_at: new Date().toISOString() })
          .eq('id', household.id)
          .then(({ error }) => setStatus(error ? 'error' : 'synced'));
      }
      return next;
    });
  }, [household?.id]);

  const createHousehold = useCallback(async (name) => {
    const { data: h, error } = await supabase.rpc('create_household', { household_name: name || 'Mi hogar' });
    if (error) { setStatus('error'); return { error: error.message }; }
    setHousehold(h);
    setData(h.data || {});
    writeLocalFallback(h.data || {});
    setStatus('synced');
    loadMembers(h.id);
    return { household: h };
  }, []);

  const joinHousehold = useCallback(async (code) => {
    const { data: h, error } = await supabase.rpc('join_household', { code });
    if (error) return { error: error.message?.includes('CODIGO_INVALIDO') ? 'CODIGO_INVALIDO' : error.message };
    setHousehold(h);
    setData(h.data || {});
    writeLocalFallback(h.data || {});
    setStatus('synced');
    loadMembers(h.id);
    return { household: h };
  }, []);

  const leaveHousehold = useCallback(async () => {
    if (!household?.id) return;
    await supabase.rpc('leave_household', { target_household: household.id });
    setHousehold(null);
    setMembers([]);
    setStatus('no-household');
  }, [household?.id]);

  const regenerateCode = useCallback(async () => {
    if (!household?.id) return null;
    const { data: newCode, error } = await supabase.rpc('regenerate_invite_code', { target_household: household.id });
    if (error) return null;
    setHousehold((h) => (h ? { ...h, invite_code: newCode } : h));
    return newCode;
  }, [household?.id]);

  const transferOwnership = useCallback(async (newOwnerId) => {
    if (!household?.id) return false;
    const { error } = await supabase.rpc('transfer_household_ownership', {
      target_household: household.id, new_owner: newOwnerId,
    });
    if (!error) loadMembers(household.id);
    return !error;
  }, [household?.id]);

  // Expulsar a otro miembro (solo el propietario puede hacerlo — lo aplica
  // RLS en la tabla, no hace falta ninguna función especial).
  const removeMember = useCallback(async (userId) => {
    if (!household?.id) return false;
    const { error } = await supabase
      .from('household_members')
      .delete()
      .eq('household_id', household.id)
      .eq('user_id', userId);
    if (!error) loadMembers(household.id);
    return !error;
  }, [household?.id]);

  const deleteHousehold = useCallback(async (confirmName) => {
    if (!household?.id) return false;
    const { error } = await supabase.rpc('delete_household', {
      target_household: household.id, confirm_name: confirmName,
    });
    if (error) return false;
    setHousehold(null);
    setMembers([]);
    setStatus('no-household');
    return true;
  }, [household?.id]);

  // Baja voluntaria de la cuenta (no del hogar). Llama a la Edge Function
  // "delete-account", el único punto de toda la app que usa la service_role
  // key — y solo en el servidor, nunca aquí en el cliente. Si el usuario es
  // propietario de un hogar con más gente, la función devuelve
  // REQUIERE_DECISION y hay que volver a llamarla indicando transferTo o
  // deleteHousehold.
  const deleteMyAccount = useCallback(async ({ transferTo, deleteHousehold: alsoDeleteHousehold } = {}) => {
    if (!isSupabaseConfigured) return { error: 'NO_CONFIGURADO' };
    const { data: res, error } = await supabase.functions.invoke('delete-account', {
      body: { transferTo, deleteHousehold: alsoDeleteHousehold },
    });
    if (error) {
      // supabase-js mete el cuerpo de la respuesta de error en error.context, si existe
      const bodyError = error.context?.error;
      return { error: bodyError || error.message };
    }
    if (res?.error) return { error: res.error, householdId: res.householdId };
    await supabase.auth.signOut();
    setHousehold(null);
    setMembers([]);
    setUser(null);
    return { ok: true };
  }, []);

  // --- Vincular la sesión anónima actual a una cuenta de Google -----------
  // Si esa cuenta de Google ya existía de antes (otro dispositivo), la
  // vinculación falla (Supabase no permite que una identidad pertenezca a
  // dos usuarios); en ese caso cerramos la sesión anónima y hacemos un login
  // normal, que te llevará a tu cuenta y hogar reales de siempre.
  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      await supabase.auth.signOut();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setHousehold(null);
    setMembers([]);
    // Al cerrar sesión, se crea automáticamente una sesión anónima nueva la
    // próxima vez que se cargue la app (ver ensureSession arriba).
  }, []);

  const value = {
    household, members, data, status, save,
    createHousehold, joinHousehold, leaveHousehold, regenerateCode, transferOwnership, deleteHousehold,
    removeMember, deleteMyAccount,
    isSupabaseConfigured, user, authLoading, signInWithGoogle, signOut,
    // Compat: código de invitación con el mismo nombre que usaba el resto de la app.
    code: household?.invite_code || null,
  };
  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>;
}

export function useCloud() {
  const ctx = useContext(CloudSyncContext);
  if (!ctx) throw new Error('useCloud debe usarse dentro de CloudSyncProvider');
  return ctx;
}

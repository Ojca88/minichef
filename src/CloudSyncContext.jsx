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

// Hashea un token de invitación en el navegador con el mismo algoritmo
// (SHA-256) que usa la Edge Function al crearlo — así nunca viaja ni se
// compara el token en claro por la red salvo dentro de la propia URL que ya
// lo contenía de entrada.
export async function hashInviteToken(token) {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Cuando una Edge Function responde con un error (status distinto de 2xx),
// supabase-js NO nos da directamente el código de error que nosotros mismos
// definimos (p. ej. 'SOLO_EL_PROPIETARIO_PUEDE_INVITAR') — error.context es
// el objeto Response en crudo de esa llamada, hay que leer su cuerpo aparte.
// Sin este paso, siempre se caía al mensaje genérico de supabase-js
// ("Edge Function returned a non-2xx status code"), ocultando la causa real.
async function extractFunctionError(error) {
  if (!error) return null;
  try {
    if (error.context && typeof error.context.json === 'function') {
      const body = await error.context.json();
      if (body?.error) return body.error;
    }
  } catch { /* el cuerpo no era JSON válido, o ya se había leído antes */ }
  return error.message || null;
}

const CloudSyncContext = createContext(null);

export function CloudSyncProvider({ children }) {
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [data, setData] = useState(readLocalFallback);
  // status: 'offline' | 'authenticating' | 'logged-out' | 'no-household' | 'loading' | 'synced' | 'error'
  const [status, setStatus] = useState(isSupabaseConfigured ? 'authenticating' : 'offline');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const channelRef = useRef(null);

  // --- Sesión: MiniChef exige Google para todo. Ya no se crea ninguna
  // sesión anónima automática al arrancar — solo se comprueba si YA hay
  // alguna sesión (anónima de una versión anterior de la app, o de Google)
  // y se deja que sea signInWithGoogle() quien decida qué hacer con ella.
  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthLoading(false); return undefined; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(profileFromSession(session));
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(profileFromSession(session));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const loadHousehold = useCallback(async () => {
    if (!isSupabaseConfigured || !user || user.isAnonymous) return;
    setStatus('loading');
    const { data: h, error } = await supabase.rpc('my_household').maybeSingle();
    if (error) { setStatus('error'); return; }
    if (!h) { setHousehold(null); setStatus('no-household'); return; }
    setHousehold(h);
    setData(h.data || {});
    writeLocalFallback(h.data || {});
    setStatus('synced');
    loadMembers(h.id);
    loadInvitations(h.id);
  }, [user]);

  async function loadMembers(householdId) {
    const { data: rows } = await supabase
      .from('household_members')
      .select('user_id, role, profiles(display_name, avatar_url, email)')
      .eq('household_id', householdId);
    setMembers(rows || []);
  }

  async function loadInvitations(householdId) {
    await supabase.rpc('expire_stale_invitations');
    const { data: rows } = await supabase
      .from('household_invitations')
      .select('id, invited_email, status, created_at, expires_at')
      .eq('household_id', householdId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setInvitations(rows || []);
  }

  useEffect(() => {
    if (user && !user.isAnonymous) loadHousehold();
    else if (user) setStatus('logged-out'); // sesión anónima heredada, no cuenta como "logueado"
    else if (!authLoading) setStatus('logged-out');
  }, [user, authLoading, loadHousehold]);

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

  const leaveHousehold = useCallback(async () => {
    if (!household?.id) return;
    await supabase.rpc('leave_household', { target_household: household.id });
    setHousehold(null);
    setMembers([]);
    setInvitations([]);
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
    setInvitations([]);
    setStatus('no-household');
    return true;
  }, [household?.id]);

  const deleteMyAccount = useCallback(async ({ transferTo, deleteHousehold: alsoDeleteHousehold } = {}) => {
    if (!isSupabaseConfigured) return { error: 'NO_CONFIGURADO' };
    const { data: res, error } = await supabase.functions.invoke('delete-account', {
      body: { transferTo, deleteHousehold: alsoDeleteHousehold },
    });
    if (error) {
      const bodyError = await extractFunctionError(error);
      return { error: bodyError || error.message };
    }
    if (res?.error) return { error: res.error, householdId: res.householdId };
    await supabase.auth.signOut();
    setHousehold(null);
    setMembers([]);
    setInvitations([]);
    setUser(null);
    return { ok: true };
  }, []);

  // --- Invitar a alguien por email (solo el propietario) -------------------
  const sendInvitation = useCallback(async (email) => {
    if (!isSupabaseConfigured) return { error: 'NO_CONFIGURADO' };
    const { data: res, error } = await supabase.functions.invoke('send-household-invitation', { body: { email } });
    if (error) {
      const bodyError = await extractFunctionError(error);
      return { error: bodyError || error.message };
    }
    if (res?.error) return { error: res.error };
    if (household?.id) loadInvitations(household.id);
    return { ok: true, emailSent: res?.emailSent, emailError: res?.emailError, inviteLink: res?.inviteLink };
  }, [household?.id]);

  const revokeInvitation = useCallback(async (invitationId) => {
    const { error } = await supabase.rpc('revoke_household_invitation', { p_invitation_id: invitationId });
    if (!error && household?.id) loadInvitations(household.id);
    return !error;
  }, [household?.id]);

  // Aceptar una invitación a partir de su token en claro (viene de la URL
  // /invite/:token). Hashea el token en el navegador y llama a la función
  // atómica en Postgres — nunca decide nada de esto el frontend por su
  // cuenta.
  const acceptInvitation = useCallback(async (token) => {
    if (!isSupabaseConfigured) return { error: 'NO_CONFIGURADO' };
    const tokenHash = await hashInviteToken(token);
    const { data: res, error } = await supabase.rpc('accept_household_invitation', { p_token_hash: tokenHash });
    if (error) return { error: error.message };
    if (res?.error) return { error: res.error, invitedEmail: res.invited_email };
    await loadHousehold();
    return { ok: true };
  }, [loadHousehold]);

  // --- Vincular la sesión actual (o crear una nueva) a una cuenta de Google.
  // Si ya había una sesión (por ejemplo, una anónima heredada de una versión
  // anterior de la app), intenta vincularla conservando su hogar. Si esa
  // cuenta de Google ya existía de antes (otro dispositivo), la vinculación
  // falla y hacemos un login normal, que lleva a la cuenta y hogar reales.
  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (!error) return;
      await supabase.auth.signOut();
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
    setHousehold(null);
    setMembers([]);
    setInvitations([]);
    setStatus('logged-out');
  }, []);

  const value = {
    household, members, invitations, data, status, save,
    createHousehold, leaveHousehold, regenerateCode, transferOwnership, deleteHousehold,
    removeMember, deleteMyAccount, sendInvitation, revokeInvitation, acceptInvitation,
    isSupabaseConfigured, user, authLoading, signInWithGoogle, signOut,
    code: household?.invite_code || null,
  };
  return <CloudSyncContext.Provider value={value}>{children}</CloudSyncContext.Provider>;
}

export function useCloud() {
  const ctx = useContext(CloudSyncContext);
  if (!ctx) throw new Error('useCloud debe usarse dentro de CloudSyncProvider');
  return ctx;
}

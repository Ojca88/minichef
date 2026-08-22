import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALLERGENS_TO_INTRODUCE } from '../data';
import { useCloud } from '../CloudSyncContext';

const REACTIONS = [
  { value: 'loved', emoji: '😍', label: 'Le encantó' },
  { value: 'liked', emoji: '😊', label: 'Le gustó' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'rejected', emoji: '🙅', label: 'Lo rechazó' },
];

const REACTION_TYPES = [
  { value: 'rash', label: 'Sarpullido / urticaria' },
  { value: 'vomiting', label: 'Vómitos' },
  { value: 'swelling', label: 'Hinchazón' },
  { value: 'other', label: 'Otra' },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Allergens() {
  const navigate = useNavigate();
  const { data, save, user } = useCloud();
  const log = data.allergenLog || {};
  const [openKey, setOpenKey] = useState(null);

  const introducedCount = ALLERGENS_TO_INTRODUCE.filter((a) => log[a.key]?.introduced).length;

  function updateEntry(key, patch) {
    save((prev) => ({
      ...prev,
      allergenLog: {
        ...(prev.allergenLog || {}),
        [key]: { ...(prev.allergenLog?.[key] || {}), ...patch },
      },
    }));
  }

  function markIntroduced(key) {
    const by = user ? { userId: user.id, name: user.name, avatar: user.avatar } : null;
    updateEntry(key, { introduced: true, date: todayISO(), by });
    setOpenKey(key);
  }

  function unmark(key) {
    updateEntry(key, { introduced: false, reaction: null, reactionType: null, hasReaction: false, notes: '' });
    setOpenKey(null);
  }

  return (
    <div style={{ padding: '20px 16px 90px' }}>
      <button
        onClick={() => navigate('/')}
        aria-label="Volver"
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, background: 'none', border: 'none', color: 'var(--ink-muted)', fontSize: 13, fontWeight: 600, padding: 0 }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 5 8 12l7 7" fill="none" stroke="var(--ink-muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver
      </button>

      <h1 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 6 }}>🛡️ Alérgenos</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginBottom: 4, lineHeight: 1.5 }}>
        Registra cuándo introduces cada alérgeno principal y cómo le sentó. Solo es un apoyo para
        llevar el seguimiento — no sustituye el consejo de tu pediatra.
      </p>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--sage-dark)', marginBottom: 18 }}>
        {introducedCount} de {ALLERGENS_TO_INTRODUCE.length} introducidos
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ALLERGENS_TO_INTRODUCE.map((a) => {
          const entry = log[a.key] || {};
          const isOpen = openKey === a.key;
          return (
            <div key={a.key} style={{
              border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden',
              background: entry.introduced ? 'var(--sage-light)' : 'var(--white)',
            }}>
              <button
                onClick={() => setOpenKey(isOpen ? null : a.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '13px 14px', background: 'none', border: 'none', textAlign: 'left',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                  {entry.introduced ? (
                    <span style={{ color: 'var(--sage-dark)', fontSize: 16 }}>✓</span>
                  ) : (
                    <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid var(--line)' }} />
                  )}
                  {a.label}
                  {entry.introduced && entry.reaction && (
                    <span>{REACTIONS.find((r) => r.value === entry.reaction)?.emoji}</span>
                  )}
                  {entry.hasReaction && <span title="Tuvo una reacción">⚠️</span>}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                  {entry.introduced ? entry.date : 'Sin introducir'}
                </span>
              </button>

              {isOpen && (
                <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {!entry.introduced ? (
                    <button
                      onClick={() => markIntroduced(a.key)}
                      className="pressable"
                      style={{ padding: '10px 0', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--sage)', color: 'white', fontSize: 13, fontWeight: 600 }}
                    >
                      Marcar como introducido hoy
                    </button>
                  ) : (
                    <>
                      <div>
                        <p style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginBottom: 6 }}>¿Qué tal le sentó?</p>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {REACTIONS.map((r) => (
                            <button
                              key={r.value}
                              onClick={() => updateEntry(a.key, { reaction: r.value })}
                              className="pressable"
                              style={{
                                flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)', fontSize: 18,
                                border: '1.5px solid ' + (entry.reaction === r.value ? 'var(--sage)' : 'var(--line)'),
                                background: entry.reaction === r.value ? 'var(--sage-light)' : 'var(--white)',
                              }}
                              aria-label={r.label}
                              title={r.label}
                            >
                              {r.emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                        <input
                          type="checkbox"
                          checked={Boolean(entry.hasReaction)}
                          onChange={(e) => updateEntry(a.key, { hasReaction: e.target.checked, reactionType: e.target.checked ? entry.reactionType : null })}
                          style={{ width: 16, height: 16, accentColor: '#C4302B' }}
                        />
                        ¿Hubo alguna reacción? (sarpullido, vómitos u otra)
                      </label>

                      {entry.hasReaction && (
                        <select
                          value={entry.reactionType || ''}
                          onChange={(e) => updateEntry(a.key, { reactionType: e.target.value })}
                          style={{ fontSize: 13, padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}
                        >
                          <option value="">Tipo de reacción...</option>
                          {REACTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      )}

                      <textarea
                        value={entry.notes || ''}
                        onChange={(e) => updateEntry(a.key, { notes: e.target.value })}
                        placeholder="Notas (opcional)"
                        rows={2}
                        style={{ fontSize: 13, padding: '9px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', resize: 'vertical', fontFamily: 'inherit' }}
                      />

                      {entry.hasReaction && (
                        <p style={{ fontSize: 11, color: '#9A5A20', lineHeight: 1.5 }}>
                          Si la reacción te preocupa, consulta con el pediatra antes de volver a ofrecer este alimento.
                        </p>
                      )}

                      <button
                        onClick={() => unmark(a.key)}
                        style={{ fontSize: 11.5, color: 'var(--ink-muted)', background: 'none', border: 'none', textDecoration: 'underline', textAlign: 'left' }}
                      >
                        Desmarcar como introducido
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

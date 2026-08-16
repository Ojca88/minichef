const GROUPS = [
  { name: 'Verduras', tried: true },
  { name: 'Frutas', tried: true },
  { name: 'Cereales', tried: true },
  { name: 'Proteína animal', tried: true },
  { name: 'Legumbres', tried: false },
  { name: 'Lácteos', tried: true },
];

export default function Tracking() {
  const pending = GROUPS.filter(g => !g.tried);

  return (
    <div style={{ padding: '20px 16px 90px' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22 }}>Seguimiento nutricional</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>Esta semana</p>
      </header>

      {pending.length > 0 && (
        <div style={{
          background: 'var(--apricot-light)', borderRadius: 'var(--radius-md)', padding: '14px 16px',
          marginBottom: 18, display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M12 3 2 20h20L12 3Z" fill="none" stroke="#9A5A20" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M12 9v5M12 17h.01" stroke="#9A5A20" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: 13, color: '#9A5A20' }}>
            Esta semana no ha probado {pending.map(g => g.name.toLowerCase()).join(', ')}.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {GROUPS.map(g => (
          <div key={g.name} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
          }}>
            <span style={{ fontSize: 14 }}>{g.name}</span>
            <span style={{
              fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 999,
              background: g.tried ? 'var(--sage-light)' : 'var(--apricot-light)',
              color: g.tried ? 'var(--sage-dark)' : '#9A5A20',
            }}>
              {g.tried ? 'Probado' : 'Pendiente'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

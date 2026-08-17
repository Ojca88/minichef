const TONES = {
  sage: { bg: 'var(--sage-light)', fg: 'var(--sage-dark)', border: 'rgba(78, 107, 84, 0.18)' },
  apricot: { bg: 'var(--apricot-light)', fg: '#9A5A20', border: 'rgba(154, 90, 32, 0.16)' },
  blue: { bg: 'var(--blue-light)', fg: '#2E5670', border: 'rgba(46, 86, 112, 0.16)' },
};

export default function Badge({ children, tone = 'sage' }) {
  const t = TONES[tone];
  return (
    <span style={{
      display: 'inline-block', fontSize: 12, fontWeight: 500,
      background: t.bg, color: t.fg, padding: '3px 10px', borderRadius: 999,
      border: `1px solid ${t.border}`,
    }}>
      {children}
    </span>
  );
}

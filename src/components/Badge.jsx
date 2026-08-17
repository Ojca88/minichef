const TONES = {
  sage: { bg: 'var(--sage-light)', fg: 'var(--sage-dark)' },
  apricot: { bg: 'var(--apricot-light)', fg: '#9A5A20' },
  blue: { bg: 'var(--blue-light)', fg: '#2E5670' },
};

export default function Badge({ children, tone = 'sage' }) {
  const t = TONES[tone];
  return (
    <span style={{
      display: 'inline-block', fontSize: 12, fontWeight: 500,
      background: t.bg, color: t.fg, padding: '3px 10px', borderRadius: 999,
    }}>
      {children}
    </span>
  );
}

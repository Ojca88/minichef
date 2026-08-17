import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/', label: 'Inicio', icon: 'home' },
  { to: '/planificador', label: 'Semana', icon: 'calendar' },
  { to: '/recetario', label: 'Recetas', icon: 'book' },
  { to: '/seguimiento', label: 'Progreso', icon: 'leaf' },
  { to: '/lista-compra', label: 'Compra', icon: 'cart' },
];

const ICONS = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  book: <path d="M4 4.5c2.5-1 5.5-1 8 0v15c-2.5-1-5.5-1-8 0v-15ZM20 4.5c-2.5-1-5.5-1-8 0v15c2.5-1 5.5-1 8 0v-15Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
  leaf: <path d="M5 19c-1-6 2-13 14-14 1 12-6 15-14 14Zm0 0c3-3 6-6 10-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
  cart: <><circle cx="9" cy="20" r="1.4" fill="currentColor" /><circle cx="17" cy="20" r="1.4" fill="currentColor" /><path d="M3 4h2l2.2 11.2a1.8 1.8 0 0 0 1.78 1.5h7.6a1.8 1.8 0 0 0 1.77-1.46L20 8H6.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
};

export default function BottomNav() {
  return (
    <nav style={{
      position: 'sticky', bottom: 0, left: 0, right: 0,
      display: 'flex', background: 'var(--white)',
      borderTop: '1px solid var(--line)', padding: '8px 2px calc(8px + env(safe-area-inset-bottom))',
      zIndex: 10,
    }}>
      {ITEMS.map(item => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} style={({ isActive }) => ({
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          padding: '4px 0', color: isActive ? 'var(--sage-dark)' : 'var(--ink-muted)',
        })}>
          <svg width="21" height="21" viewBox="0 0 24 24" aria-hidden="true">{ICONS[item.icon]}</svg>
          <span style={{ fontSize: 10.5, fontWeight: 500 }}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

import type { Tab } from '../hooks/useAppState';
import { HomeIcon, PlanIcon, BookIcon, ChartIcon, CartIcon } from './Icons';

const TABS: { key: Tab; label: string; icon: typeof HomeIcon }[] = [
  { key: 'inicio', label: 'Inicio', icon: HomeIcon },
  { key: 'plan', label: 'Plan', icon: PlanIcon },
  { key: 'recetario', label: 'Recetas', icon: BookIcon },
  { key: 'seguimiento', label: 'Progreso', icon: ChartIcon },
  { key: 'compra', label: 'Compra', icon: CartIcon },
];

interface BottomNavProps {
  activeTab: Tab;
  onSelect: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onSelect }: BottomNavProps) {
  return (
    <nav className="app-bottom-nav">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          className={`tab-btn ${activeTab === key ? 'active' : ''}`}
          onClick={() => onSelect(key)}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

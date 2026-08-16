import { useRef } from 'react';
import type { Tab } from './useAppState';

const TAB_ORDER: Tab[] = ['inicio', 'plan', 'recetario', 'seguimiento', 'compra'];

const SWIPE_THRESHOLD = 60;

/** Horizontal swipe → adjacent tab. Ignores touches starting inside [data-no-swipe]
 * (e.g. the horizontally-scrolling day-chip row) so it doesn't fight that scroll. */
export function useSwipeTabs(activeTab: Tab, setActiveTab: (tab: Tab) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-swipe]')) {
      start.current = null;
      return;
    }
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const from = start.current;
    start.current = null;
    if (!from) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - from.x;
    const dy = t.clientY - from.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) return;

    const idx = TAB_ORDER.indexOf(activeTab);
    if (dx < 0 && idx < TAB_ORDER.length - 1) setActiveTab(TAB_ORDER[idx + 1]);
    else if (dx > 0 && idx > 0) setActiveTab(TAB_ORDER[idx - 1]);
  };

  return { onTouchStart, onTouchEnd };
}

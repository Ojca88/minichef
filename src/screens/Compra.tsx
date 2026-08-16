import type { AppState } from '../hooks/useAppState';
import { categoryFor, getRecipe } from '../data/recipes';

interface CompraProps {
  state: AppState;
}

export function Compra({ state }: CompraProps) {
  const shoppingCounts: Record<string, number> = {};
  Object.values(state.plan).forEach((id) => {
    const r = getRecipe(id);
    if (!r) return;
    r.ingredients.forEach((ing) => { shoppingCounts[ing] = (shoppingCounts[ing] || 0) + 1; });
  });

  const byCategory: Record<string, { name: string; count: number }[]> = {};
  Object.entries(shoppingCounts).forEach(([name, count]) => {
    const cat = categoryFor(name);
    (byCategory[cat] = byCategory[cat] || []).push({ name, count });
  });

  const categories = Object.keys(byCategory).map((cat) => ({
    name: cat,
    items: byCategory[cat].slice().sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 style={{ margin: 0 }}>Lista de la compra</h4>
      <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>Generada a partir del menú de esta semana.</p>
      {categories.map((cat) => (
        <div className="card elev-sm" style={{ gap: 8 }} key={cat.name}>
          <span className="card-title" style={{ fontSize: 14 }}>{cat.name}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {cat.items.map((it) => {
              const checked = !!state.shoppingChecked[it.name];
              return (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }} key={it.name}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => state.toggleShoppingItem(it.name)}
                    style={{ width: 18, height: 18, accentColor: 'var(--color-accent)' }}
                  />
                  <span style={{ textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.45 : 1 }}>
                    {it.name} · x{it.count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

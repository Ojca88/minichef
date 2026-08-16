import { useState, type FormEvent } from 'react';
import type { AppState } from '../hooks/useAppState';
import { categoryFor, getRecipe } from '../data/recipes';
import { CloseIcon } from '../components/Icons';

interface CompraProps {
  state: AppState;
}

export function Compra({ state }: CompraProps) {
  const [newItem, setNewItem] = useState('');

  const shoppingCounts: Record<string, number> = {};
  Object.values(state.plan).forEach((id) => {
    const r = getRecipe(state.recipes, id);
    if (!r) return;
    r.ingredients.forEach((ing) => { shoppingCounts[ing.name] = (shoppingCounts[ing.name] || 0) + 1; });
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

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    state.addCustomItem(newItem);
    setNewItem('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h4 style={{ margin: 0 }}>Lista de la compra</h4>
      <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>Generada a partir del menú de la semana {state.selectedWeek + 1} del planificador. Añade lo que te falte a mano.</p>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Añadir artículo (ej. pañales, leche...)"
          className="input"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={!newItem.trim()}>Añadir</button>
      </form>

      {state.customItems.length > 0 && (
        <div className="card elev-sm" style={{ gap: 8 }}>
          <span className="card-title" style={{ fontSize: 14 }}>Añadidos a mano</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {state.customItems.map((it) => {
              const key = `custom:${it.id}`;
              const checked = !!state.shoppingChecked[key];
              return (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => state.toggleShoppingItem(key)}
                      style={{ width: 18, height: 18, accentColor: 'var(--color-accent)' }}
                    />
                    <span style={{ textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.45 : 1 }}>
                      {it.name}
                    </span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-icon btn-ghost"
                    title="Eliminar"
                    onClick={() => state.removeCustomItem(it.id)}
                  >
                    <CloseIcon size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

import { useState } from 'react';
import { RECIPES } from '../data';

function buildList() {
  const set = new Map();
  RECIPES.slice(0, 6).forEach(r => {
    r.ingredients.forEach(ing => set.set(ing, false));
  });
  return Array.from(set.entries()).map(([name, checked]) => ({ name, checked }));
}

export default function ShoppingList() {
  const [items, setItems] = useState(buildList);

  function toggle(name) {
    setItems(prev => prev.map(i => i.name === name ? { ...i, checked: !i.checked } : i));
  }

  return (
    <div style={{ padding: '20px 16px 90px' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22 }}>Lista de la compra</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>Generada desde tu menú semanal</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <label key={item.name} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
            padding: '12px 14px', cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggle(item.name)}
              style={{ width: 18, height: 18, accentColor: 'var(--sage)' }}
            />
            <span style={{
              fontSize: 14,
              textDecoration: item.checked ? 'line-through' : 'none',
              color: item.checked ? 'var(--ink-muted)' : 'var(--ink)',
            }}>
              {item.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

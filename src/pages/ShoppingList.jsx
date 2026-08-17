import { useState } from 'react';
import { useCloud } from '../CloudSyncContext';
import { recipeById } from '../data';

function nextId() {
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_ITEMS = [];
const MEALS = ['Comida', 'Merienda', 'Cena'];

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function currentWeekDates() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const day2 = new Date(d);
    day2.setDate(day2.getDate() + i);
    return day2;
  });
}

export default function ShoppingList() {
  const { data, save } = useCloud();
  const items = data.shoppingItems || DEFAULT_ITEMS;
  const [draft, setDraft] = useState('');

  function setItems(updater) {
    save(prev => ({
      ...prev,
      shoppingItems: typeof updater === 'function' ? updater(prev.shoppingItems || DEFAULT_ITEMS) : updater,
    }));
  }

  function toggle(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function addItem() {
    const name = draft.trim();
    if (!name) return;
    setItems(prev => [{ id: nextId(), name, checked: false, manual: true }, ...prev]);
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  }

  function addFromWeekMenu() {
    const plans = data.plans || {};
    const names = new Set();
    currentWeekDates().forEach((d) => {
      const entry = plans[dateKey(d)];
      if (!entry) return;
      MEALS.forEach((meal) => {
        const recipe = entry[meal] ? recipeById(entry[meal]) : null;
        recipe?.ingredients.forEach((ing) => names.add(ing));
      });
    });
    setItems(prev => {
      const existing = new Set(prev.map(i => i.name));
      const toAdd = Array.from(names).filter(n => !existing.has(n))
        .map(name => ({ id: nextId(), name, checked: false, manual: false }));
      return [...toAdd, ...prev];
    });
  }

  return (
    <div style={{ padding: '20px 16px 90px' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22 }}>Lista de la compra</h1>
        <p style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>Compartida con tu hogar</p>
      </header>

      <button
        onClick={addFromWeekMenu}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 13, fontWeight: 500, color: 'var(--sage-dark)', background: 'var(--sage-light)',
          border: 'none', borderRadius: 'var(--radius-md)', padding: '11px 0', marginBottom: 14,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 5h17M3.5 9h17M3.5 13h17M3.5 17h9" stroke="var(--sage-dark)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Añadir ingredientes del menú de esta semana
      </button>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Añadir artículo (ej. pañales, aceite...)"
          aria-label="Añadir artículo a la lista"
          style={{
            flex: 1, fontSize: 14, padding: '11px 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--line)', background: 'var(--white)', color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
          }}
        />
        <button
          onClick={addItem}
          aria-label="Añadir a la lista"
          style={{
            width: 44, height: 44, flexShrink: 0, borderRadius: 'var(--radius-md)', border: 'none',
            background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Tu lista está vacía. Añade el primer artículo arriba.</p>
        )}
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggle(item.id)}
                style={{ width: 18, height: 18, accentColor: 'var(--sage)', flexShrink: 0 }}
              />
              <span style={{
                fontSize: 14,
                textDecoration: item.checked ? 'line-through' : 'none',
                color: item.checked ? 'var(--ink-muted)' : 'var(--ink)',
              }}>
                {item.name}
              </span>
              {item.manual && (
                <span style={{
                  fontSize: 10, color: 'var(--ink-muted)', background: 'var(--blue-light)',
                  borderRadius: 999, padding: '2px 8px', flexShrink: 0,
                }}>
                  Añadido
                </span>
              )}
            </label>
            <button
              onClick={() => removeItem(item.id)}
              aria-label={`Quitar ${item.name} de la lista`}
              style={{
                width: 26, height: 26, flexShrink: 0, borderRadius: '50%', border: 'none',
                background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--ink-muted)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

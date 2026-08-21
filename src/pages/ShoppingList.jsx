import { useState, useMemo } from 'react';
import { useCloud } from '../CloudSyncContext';
import { recipeById } from '../data';

function nextId() {
  return `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_ITEMS = [];
const MEALS = ['Comida', 'Merienda', 'Cena'];
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Parte el mes en tramos de 7 días (1-7, 8-14, 15-21, 22-28, 29-fin) para
// poder elegir "la compra de la semana 1", "de la 2", etc. No están alineados
// a lunes-domingo a propósito: para hacer la compra, lo intuitivo es pensar
// en "los primeros 7 días del mes", no en semanas naturales que empiezan a
// mitad de mes.
function buildWeeksOfMonth(year, month) {
  const totalDays = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  for (let start = 1; start <= totalDays; start += 7) {
    const end = Math.min(start + 6, totalDays);
    const dates = [];
    for (let d = start; d <= end; d++) dates.push(new Date(year, month, d));
    weeks.push({ label: `Semana ${weeks.length + 1}`, rangeLabel: start === end ? `${start}` : `${start}-${end}`, dates });
  }
  return weeks;
}

export default function ShoppingList() {
  const { data, save, user } = useCloud();
  const items = data.shoppingItems || DEFAULT_ITEMS;
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState({ manual: true, menu: true });
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedWeeks, setSelectedWeeks] = useState(() => new Set());

  const weeks = useMemo(() => buildWeeksOfMonth(monthCursor.year, monthCursor.month), [monthCursor]);

  function shiftMonth(delta) {
    let { year, month } = monthCursor;
    month += delta;
    if (month < 0) { month = 11; year -= 1; }
    if (month > 11) { month = 0; year += 1; }
    setMonthCursor({ year, month });
    setSelectedWeeks(new Set());
  }

  function toggleWeek(i) {
    setSelectedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }

  function toggleAllWeeks() {
    setSelectedWeeks(prev => (prev.size === weeks.length ? new Set() : new Set(weeks.map((_, i) => i))));
  }

  const manualItems = items.filter(i => i.manual);
  const menuItems = items.filter(i => !i.manual);

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
    const addedBy = user ? { userId: user.id, name: user.name, avatar: user.avatar } : null;
    setItems(prev => [{ id: nextId(), name, checked: false, manual: true, addedBy }, ...prev]);
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  }

  function addFromSelectedWeeks() {
    if (selectedWeeks.size === 0) return;
    const plans = data.plans || {};
    const names = new Set();
    selectedWeeks.forEach((weekIdx) => {
      weeks[weekIdx]?.dates.forEach((d) => {
        const entry = plans[dateKey(d)];
        if (!entry) return;
        MEALS.forEach((meal) => {
          const value = entry[meal];
          // Los platos puestos a mano (sin ficha en la base de datos) no tienen
          // ingredientes conocidos, así que simplemente se saltan aquí.
          const recipe = typeof value === 'string' ? recipeById(value) : null;
          recipe?.ingredients?.forEach((ing) => names.add(ing));
        });
      });
    });
    setItems(prev => {
      const existing = new Set(prev.map(i => i.name));
      const addedBy = user ? { userId: user.id, name: user.name, avatar: user.avatar } : null;
      const toAdd = Array.from(names).filter(n => !existing.has(n))
        .map(name => ({ id: nextId(), name, checked: false, manual: false, addedBy }));
      return [...toAdd, ...prev];
    });
    setOpen(prev => ({ ...prev, menu: true }));
  }

  // Revierte lo generado desde el menú, sin tocar nada añadido a mano.
  function clearMenuItems() {
    setItems(prev => prev.filter(i => i.manual));
  }

  function toggleGroup(key) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div style={{ paddingBottom: 90 }}>
      <header style={{
        padding: '22px 16px 26px', marginBottom: 18,
        background: 'var(--gradient-apricot-bold)',
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        boxShadow: 'var(--shadow-apricot-bold)',
      }}>
        <h1 style={{ fontSize: 26, color: 'var(--white)' }}>Lista de la compra</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>Compartida con tu hogar</p>
      </header>

      <div style={{ padding: '0 16px' }}>
      <div className="card" style={{
        background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
        padding: '14px', marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <IconButton onClick={() => shiftMonth(-1)} dir="left" label="Mes anterior" />
          <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
            {MONTH_NAMES[monthCursor.month]} {monthCursor.year}
          </span>
          <IconButton onClick={() => shiftMonth(1)} dir="right" label="Mes siguiente" />
        </div>

        <p style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 8 }}>
          Elige qué semanas quieres comprar
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {weeks.map((w, i) => {
            const active = selectedWeeks.has(i);
            return (
              <button
                key={i}
                onClick={() => toggleWeek(i)}
                aria-pressed={active}
                className="pressable"
                style={{
                  fontSize: 12, fontWeight: 500, padding: '7px 12px', borderRadius: 999,
                  border: '1px solid ' + (active ? 'var(--sage)' : 'var(--line)'),
                  background: active ? 'var(--gradient-sage)' : 'var(--white)',
                  color: active ? 'var(--white)' : 'var(--ink)',
                }}
              >
                {w.label} <span style={{ opacity: 0.8 }}>({w.rangeLabel})</span>
              </button>
            );
          })}
          <button
            onClick={toggleAllWeeks}
            className="pressable"
            style={{
              fontSize: 12, fontWeight: 500, padding: '7px 12px', borderRadius: 999,
              border: '1px solid var(--blue)',
              background: selectedWeeks.size === weeks.length ? 'var(--gradient-blue)' : 'var(--blue-light)',
              color: selectedWeeks.size === weeks.length ? 'var(--white)' : '#2E5670',
            }}
          >
            Todo el mes
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={addFromSelectedWeeks}
            disabled={selectedWeeks.size === 0}
            className="pressable"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontWeight: 500, color: 'var(--sage-dark)',
              background: selectedWeeks.size === 0 ? 'var(--sage-light)' : 'var(--sage-light)',
              opacity: selectedWeeks.size === 0 ? 0.5 : 1,
              border: 'none', borderRadius: 'var(--radius-md)', padding: '11px 8px',
              cursor: selectedWeeks.size === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M3.5 5h17M3.5 9h17M3.5 13h17M3.5 17h9" stroke="var(--sage-dark)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Añadir {selectedWeeks.size > 0 ? `(${selectedWeeks.size} semana${selectedWeeks.size > 1 ? 's' : ''})` : ''}
          </button>
          {menuItems.length > 0 && (
            <button
              onClick={clearMenuItems}
              aria-label="Quitar todos los ingredientes del menú, dejando solo lo añadido a mano"
              className="pressable"
              style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: 13, fontWeight: 500, color: '#9A5A20', background: 'var(--apricot-light)',
                border: 'none', borderRadius: 'var(--radius-md)', padding: '11px 12px',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12a8 8 0 0 1 13.7-5.7M20 12a8 8 0 0 1-13.7 5.7M17 3v4h-4M7 21v-4h4" fill="none" stroke="#9A5A20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Revertir
            </button>
          )}
        </div>
      </div>

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
          className="pressable"
          style={{
            width: 44, height: 44, flexShrink: 0, borderRadius: 'var(--radius-md)', border: 'none',
            background: 'var(--gradient-sage)', boxShadow: 'var(--shadow-sage)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Tu lista está vacía. Añade el primer artículo arriba.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ItemGroup
            title="Añadidos por mí"
            items={manualItems}
            isOpen={open.manual}
            onToggleGroup={() => toggleGroup('manual')}
            onToggleItem={toggle}
            onRemoveItem={removeItem}
            emptyText="Nada añadido a mano todavía."
          />
          <ItemGroup
            title="Del menú semanal"
            items={menuItems}
            isOpen={open.menu}
            onToggleGroup={() => toggleGroup('menu')}
            onToggleItem={toggle}
            onRemoveItem={removeItem}
            emptyText="Elige una o varias semanas arriba y pulsa 'Añadir' para traer sus ingredientes."
          />
        </div>
      )}
      </div>
    </div>
  );
}

function IconButton({ onClick, dir, label }) {
  return (
    <button aria-label={label} onClick={onClick} className="pressable" style={{
      width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--white)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path d={dir === 'left' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function ItemGroup({ title, items, isOpen, onToggleGroup, onToggleItem, onRemoveItem, emptyText }) {
  return (
    <div className="card" style={{
      background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      <button
        onClick={onToggleGroup}
        aria-expanded={isOpen}
        className="pressable"
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 16px', border: 'none', background: 'transparent', textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>{title}</span>
          <span style={{
            fontSize: 11, color: 'var(--ink-muted)', background: 'var(--sage-light)',
            borderRadius: 999, padding: '2px 8px',
          }}>
            {items.length}
          </span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
          <path d="M6 9l6 6 6-6" fill="none" stroke="var(--ink-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px 12px' }}>
          {items.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--ink-muted)', padding: '0 4px 4px' }}>{emptyText}</p>
          )}
          {items.map(item => (
            <div key={item.id} className="card" style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer', minWidth: 0 }}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => onToggleItem(item.id)}
                  style={{ width: 18, height: 18, accentColor: 'var(--sage)', flexShrink: 0 }}
                />
                <span style={{
                  fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textDecoration: item.checked ? 'line-through' : 'none',
                  color: item.checked ? 'var(--ink-muted)' : 'var(--ink)',
                }}>
                  {item.name}
                </span>
                {item.addedBy && (
                  item.addedBy.avatar ? (
                    <img src={item.addedBy.avatar} alt="" title={`Añadido por ${item.addedBy.name}`} width={16} height={16} style={{ borderRadius: '50%', flexShrink: 0 }} />
                  ) : (
                    <span title={`Añadido por ${item.addedBy.name}`} style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0, background: 'var(--sage-light)',
                      color: 'var(--sage-dark)', fontSize: 8.5, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.addedBy.name.charAt(0).toUpperCase()}
                    </span>
                  )
                )}
              </label>
              <button
                onClick={() => onRemoveItem(item.id)}
                aria-label={`Quitar ${item.name} de la lista`}
                className="icon-btn"
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
      )}
    </div>
  );
}

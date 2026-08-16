import type { CSSProperties } from 'react';
import type { AppState, Tab } from '../hooks/useAppState';
import { AGE_GROUPS } from '../data/recipes';
import { ChipGroup } from '../components/ChipGroup';
import { PlanIconFull, BookIcon, ChartIcon, CartIcon } from '../components/Icons';

interface InicioProps {
  state: AppState;
  onNavigate: (tab: Tab) => void;
}

export function Inicio({ state, onNavigate }: InicioProps) {
  const ageOptions = AGE_GROUPS.map((g) => ({
    label: g.label,
    checked: g.idx === state.ageIdx,
    onSelect: () => state.setAge(g.idx),
  }));

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h4 style={{ margin: 0 }}>Hola</h4>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.75 }}>
          Todo lo que necesitas para alimentar a tu peque, en un solo sitio.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'color-mix(in srgb, var(--color-text) 70%, transparent)' }}>
          Edad del bebé
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <ChipGroup name="age-inicio" options={ageOptions} />
        </div>
      </div>

      <div className="card elev-md" style={{ background: 'var(--color-accent)', color: 'var(--color-bg)', gap: 10 }}>
        <span className="card-kicker" style={{ color: 'var(--color-bg)', opacity: 0.85 }}>Sugerencia rápida</span>
        <h3 style={{ margin: 0, color: 'var(--color-bg)' }}>¿Qué le doy hoy?</h3>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>Te proponemos un plato de comida pensado para su edad.</p>
        <button
          type="button"
          className="btn btn-block"
          style={{ background: 'var(--color-bg)', color: 'var(--color-accent-800)', justifyContent: 'center', marginTop: 4 }}
          onClick={state.generateQuickSuggestion}
        >
          Generar sugerencia
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button type="button" className="card elev-sm" style={cardBtnStyle} onClick={() => onNavigate('plan')}>
          <PlanIconFull />
          <span className="card-title">Planificador</span>
          <p className="card-body">Menú de la semana</p>
        </button>
        <button type="button" className="card elev-sm" style={cardBtnStyle} onClick={() => onNavigate('recetario')}>
          <BookIcon size={22} color="var(--color-accent)" />
          <span className="card-title">Recetario</span>
          <p className="card-body">Filtra por edad y textura</p>
        </button>
        <button type="button" className="card elev-sm" style={cardBtnStyle} onClick={() => onNavigate('seguimiento')}>
          <ChartIcon size={22} color="var(--color-accent)" />
          <span className="card-title">Seguimiento</span>
          <p className="card-body">Grupos de alimentos probados</p>
        </button>
        <button type="button" className="card elev-sm" style={cardBtnStyle} onClick={() => onNavigate('compra')}>
          <CartIcon size={22} color="var(--color-accent)" />
          <span className="card-title">Lista de compra</span>
          <p className="card-body">Desde tu menú semanal</p>
        </button>
      </div>
    </>
  );
}

const cardBtnStyle: CSSProperties = {
  alignItems: 'flex-start', textAlign: 'left', cursor: 'pointer', border: 'none',
};

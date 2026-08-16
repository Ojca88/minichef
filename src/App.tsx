import { useAppState } from './hooks/useAppState';
import { useSwipeTabs } from './hooks/useSwipeTabs';
import { useRecipesData } from './hooks/useRecipesData';
import type { Recipe } from './data/recipes';
import { BottomNav } from './components/BottomNav';
import { FixPickerModal } from './components/FixPickerModal';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { QuickSuggestionModal } from './components/QuickSuggestionModal';
import { Inicio } from './screens/Inicio';
import { Planificador } from './screens/Planificador';
import { Recetario } from './screens/Recetario';
import { Seguimiento } from './screens/Seguimiento';
import { Compra } from './screens/Compra';

function AppShell({ recipes }: { recipes: Recipe[] }) {
  const state = useAppState(recipes);
  const { onTouchStart, onTouchEnd } = useSwipeTabs(state.activeTab, state.setActiveTab);

  return (
    <div className="app-shell">
      <main className="app-shell-content" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {state.activeTab === 'inicio' && <Inicio state={state} onNavigate={state.setActiveTab} />}
        {state.activeTab === 'plan' && <Planificador state={state} onGoCompra={() => state.setActiveTab('compra')} />}
        {state.activeTab === 'recetario' && <Recetario state={state} />}
        {state.activeTab === 'seguimiento' && <Seguimiento state={state} />}
        {state.activeTab === 'compra' && <Compra state={state} />}
      </main>

      <BottomNav activeTab={state.activeTab} onSelect={state.setActiveTab} />

      <FixPickerModal state={state} />
      <RecipeDetailModal state={state} />
      <QuickSuggestionModal state={state} />
    </div>
  );
}

function App() {
  const { recipes, loading, error, reload } = useRecipesData();

  return (
    <div className="app-shell-outer">
      {loading && (
        <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 13, opacity: 0.7 }}>Cargando recetario…</p>
        </div>
      )}
      {!loading && error && (
        <div className="app-shell" style={{ alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
          <p style={{ fontSize: 13, opacity: 0.8, textAlign: 'center' }}>
            No se ha podido cargar el recetario. Comprueba tu conexión e inténtalo de nuevo.
          </p>
          <button type="button" className="btn btn-primary" onClick={reload}>Reintentar</button>
        </div>
      )}
      {!loading && !error && <AppShell recipes={recipes} />}
    </div>
  );
}

export default App;

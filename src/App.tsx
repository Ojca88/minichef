import { useAppState } from './hooks/useAppState';
import { BottomNav } from './components/BottomNav';
import { FixPickerModal } from './components/FixPickerModal';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { QuickSuggestionModal } from './components/QuickSuggestionModal';
import { Inicio } from './screens/Inicio';
import { Planificador } from './screens/Planificador';
import { Recetario } from './screens/Recetario';
import { Seguimiento } from './screens/Seguimiento';
import { Compra } from './screens/Compra';

function App() {
  const state = useAppState();

  return (
    <div className="app-shell-outer">
      <div className="app-shell">
        <main className="app-shell-content">
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
    </div>
  );
}

export default App;

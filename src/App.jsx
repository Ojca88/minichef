import { HashRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import { useSwipeNav } from './useSwipeNav';
import { CloudSyncProvider } from './CloudSyncContext';
import LoginGate from './components/LoginGate';
import HouseholdGate from './components/HouseholdGate';
import FoodDisclaimerGate from './components/FoodDisclaimerGate';
import Home from './pages/Home';
import Planner from './pages/Planner';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Tracking from './pages/Tracking';
import ShoppingList from './pages/ShoppingList';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import InviteAccept from './pages/InviteAccept';

function MainApp() {
  const swipe = useSwipeNav();
  return (
    <LoginGate>
      <HouseholdGate>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }} onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/planificador" element={<Planner />} />
              <Route path="/recetario" element={<FoodDisclaimerGate><Recipes /></FoodDisclaimerGate>} />
              <Route path="/recetario/:id" element={<FoodDisclaimerGate><RecipeDetail /></FoodDisclaimerGate>} />
              <Route path="/seguimiento" element={<Tracking />} />
              <Route path="/lista-compra" element={<ShoppingList />} />
            </Routes>
          </div>
          <BottomNav />
        </div>
      </HouseholdGate>
    </LoginGate>
  );
}

export default function App() {
  return (
    <CloudSyncProvider>
      <HashRouter>
        <Routes>
          {/* Fuera de los gates: accesibles sin login, y la propia pantalla
              de aceptar invitación (que gestiona su propio login en contexto). */}
          <Route path="/privacidad" element={<Privacy />} />
          <Route path="/condiciones" element={<Terms />} />
          <Route path="/invite/:token" element={<InviteAccept />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </HashRouter>
    </CloudSyncProvider>
  );
}

import { HashRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Planner from './pages/Planner';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Tracking from './pages/Tracking';
import ShoppingList from './pages/ShoppingList';

export default function App() {
  return (
    <HashRouter>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/planificador" element={<Planner />} />
            <Route path="/recetario" element={<Recipes />} />
            <Route path="/recetario/:id" element={<RecipeDetail />} />
            <Route path="/seguimiento" element={<Tracking />} />
            <Route path="/lista-compra" element={<ShoppingList />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </HashRouter>
  );
}

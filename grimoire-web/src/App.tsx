import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import Layout from './components/Layout';
import { MonsterPicker } from './components/MonsterPicker';
import { MonsterDetail } from './components/MonsterCard';

function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <BrowserRouter basename="/grimoire">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<MonsterPicker />} />
              <Route path="/monster/:id" element={<MonsterDetail />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import { useTheme } from './hooks/useTheme';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Ledger = lazy(() => import('./pages/Ledger'));
const Customers = lazy(() => import('./pages/Customers'));
const Settings = lazy(() => import('./pages/Settings'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full p-8 min-h-[50vh]">
    <div className="animate-pulse flex items-center justify-center space-x-2">
      <div className="w-3 h-3 bg-blue-500/50 rounded-full"></div>
      <div className="w-3 h-3 bg-blue-500/70 rounded-full"></div>
      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
    </div>
  </div>
);

function App() {
  useTheme();
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
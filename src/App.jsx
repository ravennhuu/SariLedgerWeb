import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import { useTheme } from './hooks/useTheme';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Ledger = lazy(() => import('./pages/Ledger'));
const Customers = lazy(() => import('./pages/Customers'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8 min-h-[50vh] w-full h-full">
    <div className="animate-pulse flex items-center justify-center space-x-2">
      <div className="w-3 h-3 bg-emerald/50 rounded-full"></div>
      <div className="w-3 h-3 bg-emerald/70 rounded-full"></div>
      <div className="w-3 h-3 bg-emerald rounded-full"></div>
    </div>
  </div>
);

function App() {
  useTheme();
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Private Routes wrapped in Layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/ledger" element={<Ledger />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
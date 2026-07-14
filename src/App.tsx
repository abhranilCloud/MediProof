import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Split from './pages/Split';
import Licenses from './pages/Licenses';
import Disputes from './pages/Disputes';
import Portfolio from './pages/Portfolio';
import Transfer from './pages/Transfer';
import DashboardLayout from './components/layout/DashboardLayout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgb(16 16 19)',
            color: 'rgb(246 246 248)',
            border: '1px solid rgb(33 33 39)',
            borderRadius: '0.625rem',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: 'rgb(223 197 141)', secondary: 'rgb(9 9 11)' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route
          path="/*"
          element={
            <DashboardLayout>
              <Routes>
                <Route path="/dashboard"  element={<Dashboard />} />
                <Route path="/register"   element={<Register />} />
                <Route path="/verify"     element={<Verify />} />
                <Route path="/split"      element={<Split />} />
                <Route path="/licenses"   element={<Licenses />} />
                <Route path="/disputes"   element={<Disputes />} />
                <Route path="/portfolio"  element={<Portfolio />} />
                <Route path="/transfer"   element={<Transfer />} />
              </Routes>
            </DashboardLayout>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

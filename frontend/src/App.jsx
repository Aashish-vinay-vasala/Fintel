import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { supabase } from './lib/supabase';

import Sidebar         from './components/layout/Sidebar';
import Dashboard       from './pages/Dashboard';
import Fraud           from './pages/Fraud';
import CreditSuite     from './pages/CreditSuite';
import Risk            from './pages/Risk';
import LoanMonitor     from './pages/LoanMonitor';
import Treasury        from './pages/Treasury';
import ComplianceHub   from './pages/ComplianceHub';
import AML             from './pages/AML';
import ModelRisk       from './pages/ModelRisk';
import CustomerIntel   from './pages/CustomerIntel';
import Benchmarking    from './pages/Benchmarking';
import RiskAssets      from './pages/RiskAssets';
import Reports         from './pages/Reports';
import Documents       from './pages/Documents';
import Settings        from './pages/Settings';
import Login           from './pages/Login';
import CopilotWidget   from './components/CopilotWidget';

function PrivateRoute({ children, session }) {
  return session ? children : <Navigate to="/login" replace />;
}

function AppShell() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh' }}>
        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/fraud"          element={<Fraud />} />
          <Route path="/credit-suite"   element={<CreditSuite />} />
          <Route path="/risk"           element={<Risk />} />
          <Route path="/loans"          element={<LoanMonitor />} />
          <Route path="/treasury"       element={<Treasury />} />
          <Route path="/compliance-hub" element={<ComplianceHub />} />
          <Route path="/aml"            element={<AML />} />
          <Route path="/model-risk"     element={<ModelRisk />} />
          <Route path="/customer-intel" element={<CustomerIntel />} />
          <Route path="/benchmarking"   element={<Benchmarking />} />
          <Route path="/risk-assets"    element={<RiskAssets />} />
          <Route path="/reports"        element={<Reports />} />
          <Route path="/documents"      element={<Documents />} />
          <Route path="/settings"       element={<Settings />} />
        </Routes>
      </div>
      <CopilotWidget />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return null; // splash while Supabase resolves session

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PrivateRoute session={session}><AppShell /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

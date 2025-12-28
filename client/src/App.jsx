import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard'; // Import
import Header from './components/Header';

import PendingVerification from './pages/PendingVerification'; // Import

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Or a nice spinner
  if (!user) return <Navigate to="/" />;

  // Create a separate check for pending status if needed, 
  // or handle it inside the specific page or a specific middleware component.
  // For now, let's keep it simple: if trying to access dashboard and is pending NGO
  if (user.role === 'ngo' && !user.isVerified) {
    return <Navigate to="/pending-verification" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-brand-primary selection:text-white">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pending-verification" element={<PendingVerification />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

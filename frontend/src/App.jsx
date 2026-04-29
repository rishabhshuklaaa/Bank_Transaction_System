import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import History from './pages/History';
import Landing from './pages/Landing';

const AppLayout = ({ children }) => {
  const location = useLocation();
  // Pages where global Navbar/Sidebar should NOT be visible
  const publicPages = ['/', '/login', '/register'];
  const isPublic = publicPages.includes(location.pathname);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      {!isPublic && <Navbar />}
      <div className="flex flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Public Landing & Auth */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Financial Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="flex w-full h-full p-6 gap-6">
                <Sidebar />
                <div className="flex-1 glass-container overflow-y-auto p-8">
                  <Dashboard />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/transfer" element={
            <ProtectedRoute>
              <div className="flex w-full h-full p-6 gap-6">
                <Sidebar />
                <div className="flex-1 glass-container overflow-y-auto p-8">
                  <Transfer />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/history" element={
            <ProtectedRoute>
              <div className="flex w-full h-full p-6 gap-6">
                <Sidebar />
                <div className="flex-1 glass-container overflow-y-auto p-8">
                  <History />
                </div>
              </div>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
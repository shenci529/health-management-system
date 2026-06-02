import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import Login from './pages/Login';
import Home from './pages/Home';
import Record from './pages/Record';
import Assessment from './pages/Assessment';
import Knowledge from './pages/Knowledge';
import Exercise from './pages/Exercise';
import HealthLog from './pages/HealthLog';
import Profile from './pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/record" element={<ProtectedRoute><Record /></ProtectedRoute>} />
          <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
          <Route path="/knowledge" element={<ProtectedRoute><Knowledge /></ProtectedRoute>} />
          <Route path="/exercise" element={<ProtectedRoute><Exercise /></ProtectedRoute>} />
          <Route path="/health-log" element={<ProtectedRoute><HealthLog /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;

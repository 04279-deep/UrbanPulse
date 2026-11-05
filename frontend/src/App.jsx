import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import SmartCityMap from './pages/SmartCityMap';
import ReportComplaint from './pages/ReportComplaint';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ComplaintTracking from './pages/ComplaintTracking';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Route guard helper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B132B]">
        <div className="w-8 h-8 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-[#0B132B] text-slate-100">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/map" element={<SmartCityMap />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/track" element={<ComplaintTracking />} />
              <Route path="/track/:id" element={<ComplaintTracking />} />

              {/* Citizen & Authenticated Routes */}
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <ReportComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'authority', 'admin']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Municipal Authority Routes */}
              <Route
                path="/authority"
                element={
                  <ProtectedRoute allowedRoles={['authority', 'admin']}>
                    <AuthorityDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

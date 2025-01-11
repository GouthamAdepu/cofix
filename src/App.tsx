import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import CommunityIssues from './pages/CommunityIssues';
import GovernmentSchemes from './pages/GovernmentSchemes';
import Notices from './pages/Notices';
import Profile from './pages/Profile';
import Maps from './pages/Maps';
import ProtectedRoute from './components/ProtectedRoute';
import SessionManager from './components/SessionManager';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminDashboard from './pages/AdminDashboard';
import AdminIssues from './pages/AdminIssues';
import AdminProfile from './pages/AdminProfile';

function App() {
  return (
    <Router>
      <SessionManager />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/notices" element={
          <ProtectedRoute>
            <Notices />
          </ProtectedRoute>
        } />
        <Route path="/maps" element={
          <ProtectedRoute>
            <Maps />
          </ProtectedRoute>
        } />
        <Route path="/issues" element={
          <ProtectedRoute>
            <CommunityIssues />
          </ProtectedRoute>
        } />
        <Route path="/schemes" element={
          <ProtectedRoute>
            <GovernmentSchemes />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/issues" element={<AdminIssues />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import Billing from './pages/Billing';
import LandingPage from './pages/LandingPage';
import Info from './pages/Info';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminDocuments from './pages/admin/Documents';
import AdminBilling from './pages/admin/Billing';
import AllBills from './pages/admin/AllBills';
import Statement from './pages/admin/Statement';

// Components
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Landing Page Route (Public) */}
          <Route path="/" element={<LandingPage />} />

          {/* Client Portal Route (Public entry, but will redirect to login if not authenticated) */}
          <Route path="/client-portal" element={<PrivateRoute><MainLayout /></PrivateRoute>} />
          {/* <Route path="/dashboard" element={<PrivateRoute><MainLayout /></PrivateRoute>} /> */}

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Main Routes */}
          <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Info />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/billing" element={<Billing />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/admin/billing" element={<AdminBilling />} />
            <Route path="/admin/all-bills" element={<AllBills />} />
            <Route path="/admin/statement" element={<Statement />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 
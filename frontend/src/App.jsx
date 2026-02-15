import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Root Admin
import RootDashboard from './pages/root/Dashboard';
import AdminManagement from './pages/root/AdminManagement';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import ChallengeList from './pages/admin/challenges/ChallengeList';
import CreateChallenge from './pages/admin/challenges/CreateChallenge';

// Layout
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Admin Routes */}
          <Route path="/root" element={
            <ProtectedRoute role="root_admin">
              <RootLayout />
            </ProtectedRoute>
          }>
            <Route index element={<RootDashboard />} />
            <Route path="admins" element={<AdminManagement />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="challenges" element={<ChallengeList />} />
            <Route path="challenges/create" element={<CreateChallenge />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;



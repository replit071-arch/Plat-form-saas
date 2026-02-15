import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Root Admin
import RootDashboard from './pages/root/Dashboard';
import AdminManagement from './pages/root/AdminManagement';
import PlanManagement from './pages/root/PlanManagement';
import RootTickets from './pages/root/Tickets';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import ChallengeList from './pages/admin/challenges/ChallengeList';
import CreateChallenge from './pages/admin/challenges/CreateChallenge';
import EditChallenge from './pages/admin/challenges/EditChallenge';
import UserManagement from './pages/admin/UserManagement';
import CouponManagement from './pages/admin/CouponManagement';
import BrandingSettings from './pages/admin/BrandingSettings';
import AdminTickets from './pages/admin/Tickets';
import PayoutManagement from './pages/admin/PayoutManagement';

// User
import UserDashboard from './pages/user/Dashboard';
import BrowseChallenges from './pages/user/BrowseChallenges';
import MyChallenges from './pages/user/MyChallenges';
import RequestPayout from './pages/user/RequestPayout';
import UserTickets from './pages/user/Tickets';
import MyCertificates from './pages/user/Certificates';
import Referrals from './pages/user/Referrals';

// Layout
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

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
            <Route path="plans" element={<PlanManagement />} />
            <Route path="tickets" element={<RootTickets />} />
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
            <Route path="challenges/edit/:id" element={<EditChallenge />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="coupons" element={<CouponManagement />} />
            <Route path="branding" element={<BrandingSettings />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="payouts" element={<PayoutManagement />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={
            <ProtectedRoute role="user">
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="challenges" element={<BrowseChallenges />} />
            <Route path="my-challenges" element={<MyChallenges />} />
            <Route path="payout" element={<RequestPayout />} />
            <Route path="tickets" element={<UserTickets />} />
            <Route path="certificates" element={<MyCertificates />} />
            <Route path="referrals" element={<Referrals />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

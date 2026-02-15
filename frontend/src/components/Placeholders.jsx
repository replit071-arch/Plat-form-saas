// Placeholder component generator
import React from 'react';

export const createPlaceholder = (name) => {
  return () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
      <p className="text-gray-600 mt-2">This component is under development.</p>
    </div>
  );
};

// Export all placeholder components
export const Register = createPlaceholder('Register');
export const RootDashboard = createPlaceholder('Root Dashboard');
export const AdminManagement = createPlaceholder('Admin Management');
export const PlanManagement = createPlaceholder('Plan Management');
export const RootTickets = createPlaceholder('Root Tickets');
export const ChallengeList = createPlaceholder('Challenge List');
export const CreateChallenge = createPlaceholder('Create Challenge');
export const EditChallenge = createPlaceholder('Edit Challenge');
export const UserManagement = createPlaceholder('User Management');
export const CouponManagement = createPlaceholder('Coupon Management');
export const BrandingSettings = createPlaceholder('Branding Settings');
export const AdminTickets = createPlaceholder('Admin Tickets');
export const PayoutManagement = createPlaceholder('Payout Management');
export const UserDashboard = createPlaceholder('User Dashboard');
export const BrowseChallenges = createPlaceholder('Browse Challenges');
export const MyChallenges = createPlaceholder('My Challenges');
export const RequestPayout = createPlaceholder('Request Payout');
export const UserTickets = createPlaceholder('User Tickets');
export const MyCertificates = createPlaceholder('My Certificates');
export const Referrals = createPlaceholder('Referrals');

export default {
  Register,
  RootDashboard,
  AdminManagement,
  PlanManagement,
  RootTickets,
  ChallengeList,
  CreateChallenge,
  EditChallenge,
  UserManagement,
  CouponManagement,
  BrandingSettings,
  AdminTickets,
  PayoutManagement,
  UserDashboard,
  BrowseChallenges,
  MyChallenges,
  RequestPayout,
  UserTickets,
  MyCertificates,
  Referrals,
};

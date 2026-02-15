import React from 'react';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Layout</h1>
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;

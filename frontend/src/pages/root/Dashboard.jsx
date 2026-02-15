import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react';
import { rootAPI } from '../../utils/api';

const RootDashboard = () => {
  const [stats, setStats] = useState({
    total_admins: 0,
    active_admins: 0,
    total_users: 0,
    total_challenges: 0,
    total_revenue: 0,
    commission_earned: 0
  });
  const [loading, setLoading] = useState(true);
  const [topAdmins, setTopAdmins] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await rootAPI.getDashboard();
      setStats(response.data.stats);
      setTopAdmins(response.data.top_admins || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Admins',
      value: stats.total_admins,
      icon: Building2,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Admins',
      value: stats.active_admins,
      icon: UserCheck,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.total_revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Commission Earned',
      value: `$${(stats.commission_earned || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-pink-500',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Total Challenges',
      value: stats.total_challenges,
      icon: Calendar,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Root Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and management</p>
        </div>
        <Link
          to="/root/admins"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Building2 className="w-5 h-5" />
          Create Admin
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-4 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Performing Admins */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Admins</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Company</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Users</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Commission</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {topAdmins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No admins yet. Create your first admin to get started!
                  </td>
                </tr>
              ) : (
                topAdmins.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{admin.company_name}</td>
                    <td className="py-3 px-4 text-gray-600">{admin.email}</td>
                    <td className="py-3 px-4 text-gray-900">{admin.users_count}</td>
                    <td className="py-3 px-4 text-gray-900">${(admin.total_revenue || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-900">${(admin.commission_owed || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        admin.subscription_status === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : admin.subscription_status === 'expired'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {admin.subscription_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/root/admins"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-lg transition-all"
        >
          <Building2 className="w-8 h-8 mb-3" />
          <h4 className="text-lg font-semibold">Manage Admins</h4>
          <p className="text-blue-100 text-sm mt-1">Create and manage white-label admins</p>
        </Link>

        <Link
          to="/root/plans"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 hover:shadow-lg transition-all"
        >
          <Calendar className="w-8 h-8 mb-3" />
          <h4 className="text-lg font-semibold">Subscription Plans</h4>
          <p className="text-purple-100 text-sm mt-1">Manage pricing and features</p>
        </Link>

        <Link
          to="/root/tickets"
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 hover:shadow-lg transition-all"
        >
          <Users className="w-8 h-8 mb-3" />
          <h4 className="text-lg font-semibold">Support Tickets</h4>
          <p className="text-orange-100 text-sm mt-1">Handle admin support requests</p>
        </Link>
      </div>
    </div>
  );
};

export default RootDashboard;

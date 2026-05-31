import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/Layout/AdminLayout';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Load stats from multiple endpoints
      // Admin has access to users list, and properties list is public
      const [usersRes, propertiesRes] = await Promise.all([
        fetch('/api/users?page=1&limit=1', { headers }).catch(() => null),
        fetch('/api/properties', { headers }).catch(() => null),
      ]);

      let totalUsers = 0;
      let totalProperties = 0;

      if (usersRes?.ok) {
        const data = await usersRes.json();
        totalUsers = data.data?.pagination?.total || data.totalCount || 0;
      }

      if (propertiesRes?.ok) {
        const data = await propertiesRes.json();
        totalProperties = data.data?.totalCount || data.totalCount || (Array.isArray(data.data) ? data.data.length : 0);
      }

      setStats({
        totalUsers,
        totalProperties,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: 'group',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      link: '/admin/users',
    },
    {
      title: 'Total Properties',
      value: stats.totalProperties,
      icon: 'domain',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      link: '#', // No admin properties page yet
    },
  ];

  const quickActions = [
    { label: 'Manage Users', icon: 'manage_accounts', path: '/admin/users', color: 'bg-blue-500 hover:bg-blue-600' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome to Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your travel platform from here</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.link)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor} dark:opacity-80`}>
                  <span className={`material-symbols-outlined ${card.iconColor} dark:text-gray-300 text-2xl`}>
                    {card.icon}
                  </span>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${card.color} opacity-10 dark:opacity-20`}></div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{card.title}</h3>
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{card.value.toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`${action.color} text-white px-6 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md`}
              >
                <span className="material-symbols-outlined">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity / Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7FFFD4]">info</span>
              System Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Platform</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Wanderly Travel Planner</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Version</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">1.0.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Management Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF6B6B]">settings</span>
              Management
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Users Management', path: '/admin/users', icon: 'group' },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 group-hover:text-[#7FFFD4] transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 dark:text-gray-500 group-hover:text-[#FF6B6B] transition-colors">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}


import React, { useState, useEffect } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { User, Award, CheckCircle, Clock } from 'lucide-react';

interface AdminProfile {
  email: string;
  name: string;
  adminLevel: number;
  issuesResolved: number;
  createdAt: string;
  lastLogin: string;
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<AdminProfile>({
    email: '',
    name: '',
    adminLevel: 1,
    issuesResolved: 0,
    createdAt: '',
    lastLogin: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const adminEmail = localStorage.getItem('adminEmail');
      if (!adminEmail) {
        console.error('No admin email found');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/admin/profile?email=${adminEmail}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                <p className="text-blue-200">Administrator</p>
              </div>
            </div>
          </div>
          
          {/* Basic Info */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Issues Resolved Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Issues Resolved</h3>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{profile.issuesResolved}</p>
            <p className="text-sm text-gray-500 mt-2">Total issues successfully resolved</p>
          </div>

          {/* Admin Level Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Admin Level</h3>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">Level {profile.adminLevel}</p>
            <p className="text-sm text-gray-500 mt-2">Current administration level</p>
          </div>

          {/* Last Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Last Login</h3>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xl font-semibold text-purple-600">
              {new Date(profile.lastLogin).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">Most recent login timestamp</p>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Resolved {profile.issuesResolved} issues
                </p>
                <p className="text-sm text-gray-500">Total resolution count</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Award className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Achieved Level {profile.adminLevel}
                </p>
                <p className="text-sm text-gray-500">Current admin status</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 
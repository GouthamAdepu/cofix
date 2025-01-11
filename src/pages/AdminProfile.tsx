import React, { useState, useEffect } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { User } from 'lucide-react';

interface AdminProfile {
  email: string;
  name: string;
  adminLevel: number;
  issuesResolved: number;
  createdAt: string;
  lastLogin: string;
}

export default function AdminProfile() {
  const [profile, setProfile] = useState({
    email: '',
    name: '',
    adminLevel: 1,
    issuesResolved: 0,
    createdAt: '',
    lastLogin: ''
  });

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
    }
  };

  const handleProfileUpdate = async (updatedData: any) => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating admin profile:', error);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-indigo-600 px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-full">
                <User className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-white">Admin Profile</h3>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Admin Role</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.name}</dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Joined Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </dd>
              </div>

              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Issues Resolved</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.issuesResolved}</dd>
              </div>
            </dl>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Stats</h3>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Issues Resolved</dt>
                  <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                    {profile.issuesResolved}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Admin Level</dt>
                  <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                    Level {profile.adminLevel}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
} 
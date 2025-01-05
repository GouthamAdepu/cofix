import React from 'react';
import ProfileHeader from '../components/Profile/ProfileHeader';
import PersonalInfo from '../components/Profile/PersonalInfo';
import DashboardLayout from '../components/DashboardLayout';

export default function Profile() {
  return (
    <DashboardLayout>
       <div className="space-y-6">
      <ProfileHeader />
      
      {/* Profile Info */}
      <div className="mt-20">
        <PersonalInfo />
      </div>
    </div>
    </DashboardLayout>
  );
}
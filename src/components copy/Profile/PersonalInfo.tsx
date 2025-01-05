import React from 'react';
import { User, AtSign, Phone, MapPin, Home, Users } from 'lucide-react';
import EditProfileModal, { UserInfo } from './EditProfileModel';

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function PersonalInfo() {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [userInfo, setUserInfo] = React.useState<UserInfo>({
    fullName: "",
    nickname: "",
    phone: "",
    country: "",
    gender: "",
    address: ""
  });

  React.useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch(`http://localhost:8000/api/profile?email=${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          fullName: data.name || "",
          nickname: data.nickName || "",
          phone: data.phoneNumber || "",
          country: data.country || "",
          gender: data.gender || "",
          address: data.address || ""
        });
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleSave = async (updatedInfo: UserInfo) => {
    try {
      const response = await fetch("http://localhost:8000/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: localStorage.getItem('userEmail'),
          name: updatedInfo.fullName,
          nickName: updatedInfo.nickname,
          phoneNumber: updatedInfo.phone,
          country: updatedInfo.country,
          gender: updatedInfo.gender,
          address: updatedInfo.address,
          createDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        setUserInfo(updatedInfo);
        await fetchUserInfo(); // Refresh data
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 mt-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{userInfo.fullName}</h1>
            <p className="text-gray-500">@{userInfo.nickname}</p>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Edit Profile
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem
            icon={<User className="w-5 h-5" />}
            label="Full Name"
            value={userInfo.fullName}
          />
          <InfoItem
            icon={<AtSign className="w-5 h-5" />}
            label="Nickname"
            value={userInfo.nickname}
          />
          <InfoItem
            icon={<Phone className="w-5 h-5" />}
            label="Phone Number"
            value={userInfo.phone}
          />
          <InfoItem
            icon={<MapPin className="w-5 h-5" />}
            label="Country"
            value={userInfo.country}
          />
          <InfoItem
            icon={<Users className="w-5 h-5" />}
            label="Gender"
            value={userInfo.gender}
          />
          <InfoItem
            icon={<Home className="w-5 h-5" />}
            label="Address"
            value={userInfo.address}
          />
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userInfo={userInfo}
        onSave={handleSave}
      />
    </>
  );
}
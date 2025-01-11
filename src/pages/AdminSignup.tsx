import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';

export default function AdminSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminRole: '',
    adminCode: '123456',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/admin/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          adminLevel: formData.adminRole,
          adminCode: formData.adminCode,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        navigate('/admin/login');
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration");
    }
  };

  return (
    <AuthLayout
      title="Admin Registration"
      subtitle="Create your admin account"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          
          <Input
            label="Email address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          
          <Input
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Role
            </label>
            <select
              value={formData.adminRole}
              onChange={(e) => setFormData({ ...formData, adminRole: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Select Role</option>
              <option value="1">Level 1 Admin</option>
              <option value="2">Level 2 Admin</option>
              <option value="3">Level 3 Admin</option>
              <option value="4">Level 4 Admin</option>
            </select>
          </div>

          <input 
            type="hidden" 
            value={formData.adminCode}
          />
        </div>

        <Button
          type="submit"
          fullWidth
          icon={UserPlus}
        >
          Create Admin Account
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an admin account?{' '}
            <Link to="/admin/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </span>
        </div>
        
        <div className="text-center mt-4">
          <Link to="/signup" className="text-sm text-gray-600 hover:text-indigo-500">
            Switch to User Signup
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
} 
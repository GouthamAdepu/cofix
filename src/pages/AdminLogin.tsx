import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';

export default function AdminLogin() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('adminToken', 'true');
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminLevel', data.adminLevel);
        navigate('/admin/dashboard');
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    }
  };

  return (
    <AuthLayout
      title="Admin Portal"
      subtitle="Sign in to your admin account"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          icon={LogIn}
        >
          Sign in as Admin
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Need an admin account?{' '}
            <Link to="/admin/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register as Admin
            </Link>
          </span>
        </div>
        
        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-500">
            Switch to User Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
} 
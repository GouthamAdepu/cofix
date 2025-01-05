import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Signup() {
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted!');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const responseData = await response.json();
      
      if (response.ok) {
        alert(responseData.message);
        window.location.href = '/login'; // Redirect to login page after successful signup
      } else {
        alert(responseData.message || "Sign-up failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during sign-up");
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join our community to start reporting issues"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Full name"
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
            label="Confirm password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <Button
          type="submit"
          fullWidth
          icon={UserPlus}
        >
          Create account
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/home" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
}
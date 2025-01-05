import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, LogIn, User, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const userEmail = localStorage.getItem('userEmail');
      setIsAuthenticated(!!userEmail);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    const email = localStorage.getItem('userEmail');
    try {
      await fetch(`http://localhost:8000/api/logout?email=${email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      localStorage.removeItem('userEmail');
      localStorage.removeItem('accountData');
      setIsAuthenticated(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      localStorage.removeItem('userEmail');
      localStorage.removeItem('accountData');
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Communitifx</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/maps"
              className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              View map
            </Link>
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                    <Link
                      to="/home"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
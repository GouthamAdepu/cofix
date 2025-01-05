import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Shield, ArrowRight, Github, Mail } from 'lucide-react';
import IssueMap from '../components/Map';
import Navbar from '../components/Navbar';


const mockIssues = [
  {
    id: '1',
    title: 'Broken Street Light',
    description: 'Street light not working on Main St.',
    type: 'community',
    status: 'pending',
    urgency: 'medium',
    location: { lat: 17.6051537, lng: 78.4857042 },
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1'
  },
  {
    id: '2',
    title: 'Pothole',
    description: 'Large pothole causing traffic issues',
    type: 'community',
    status: 'solved',
    urgency: 'high',
    location: { lat:  17.6060034, lng:78.4890395 },
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '2'
  }
];

const features = [
  {
    icon: <MapPin className="h-6 w-6 text-indigo-600" />,
    title: 'Location-Based Issues',
    description: 'Report and track community issues with precise location mapping'
  },
  {
    icon: <Users className="h-6 w-6 text-indigo-600" />,
    title: 'Community Driven',
    description: 'Join forces with your neighbors to improve your community'
  },
  {
    icon: <Shield className="h-6 w-6 text-indigo-600" />,
    title: 'Quick Resolution',
    description: 'Direct connection with local authorities for faster problem-solving'
  }
];

export default function Index() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [allIssues, setAllIssues] = useState([]);

  useEffect(() => {
    // Check authentication status when component mounts
    const email = localStorage.getItem('userEmail');
    if (email) {
      checkAuthStatus(email);
    }

    // Fetch all issues when component mounts
    const fetchIssues = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/issues/all');
        if (response.ok) {
          const data = await response.json();
          setAllIssues(data);
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };

    fetchIssues();
  }, []);

  const checkAuthStatus = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/status?email=${email}`);
      const data = await response.json();
      
      setIsAuthenticated(data.isAuthenticated);
      if (data.isAuthenticated) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleLogout = async () => {
    const email = localStorage.getItem('userEmail');
    try {
      await fetch(`http://localhost:8080/api/logout?email=${email}`, {
        method: 'POST'
      });
      localStorage.removeItem('userEmail');
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleCommunityIssuesClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/home');
    } else {
      navigate('/home');
    }
  };

  const mapRef = useRef<HTMLDivElement>(null);

  const scrollToMap = (e: React.MouseEvent) => {
    e.preventDefault();
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar>
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-700 hover:text-gray-900">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800">
            Login
          </Link>
        )}
      </Navbar>
      <div className="pt-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white overflow-hidden"
        >
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Empower Your Community</span>
                    <span className="block text-indigo-600">Report & Resolve Issues</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Join Communitifx to report local issues, track their resolution, and make your community a better place. Together, we can create positive change.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <button
                        onClick={scrollToMap}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                      >
                        View Maps
                        <MapPin className="ml-2 h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                A better way to improve your community
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-50 text-indigo-600">
                        {feature.icon}
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Map Section with heading */}
        <div ref={mapRef} className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Community Issues Map
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                View reported issues in your area
              </p>
            </div>
            <div ref={mapRef} className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg">
              <IssueMap issues={allIssues} />
            </div>
          </div>
        </div>

        {/* backend -> mockissues notices pass to issue map */}

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                  <span className="text-lg font-bold">Communitifx</span>
                </div>
                <p className="text-gray-500 text-sm">
                  Empowering communities to report and resolve local issues together.
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                  Platform
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/issues" className="text-gray-500 hover:text-indigo-600 text-sm">
                      Community Issues
                    </Link>
                  </li>
                  <li>
                    <Link to="/schemes" className="text-gray-500 hover:text-indigo-600 text-sm">
                      Government Schemes
                    </Link>
                  </li>
                  <li>
                    <Link to="/notices" className="text-gray-500 hover:text-indigo-600 text-sm">
                      Notices
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                  Account
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link to="/login" className="text-gray-500 hover:text-indigo-600 text-sm">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="text-gray-500 hover:text-indigo-600 text-sm">
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="text-gray-500 hover:text-indigo-600 text-sm">
                      Profile
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                  Contact
                </h3>
                <ul className="space-y-3">
                  <li>
                    <a href="mailto:support@communitifx.com" className="text-gray-500 hover:text-indigo-600 text-sm flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      support@communitifx.com
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/communitifx" className="text-gray-500 hover:text-indigo-600 text-sm flex items-center">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-200 pt-8">
              <p className="text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Communitifx. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
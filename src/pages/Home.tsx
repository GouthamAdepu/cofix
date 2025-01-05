import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion';
import { AlertCircle, Bell, CheckCircle, Clock, Plus } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import IssueMap from '../components/Map';
import type { Issue } from '../types';
import Button from '../components/Button';

export default function Home() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    resolved: 0,
    notifications: 0
  });

  useEffect(() => {
    fetchUserIssues();
  }, []);

  const fetchUserIssues = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error('No user email found');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/profile/issues?email=${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        const formattedIssues = data.map((post: any) => ({
          id: post.postId.toString(),
          title: post.issueName,
          description: post.description || '',
          type: 'community',
          status: post.status || 'pending',
          urgency: 'medium',
          location: post.location || { lat: 0, lng: 0 },
          createdAt: new Date(post.createDate),
          updatedAt: new Date(post.createDate),
          userId: post.email
        }));

        setIssues(formattedIssues);

        // Calculate stats
        const pendingCount = formattedIssues.filter(issue => issue.status === 'pending').length;
        const resolvedCount = formattedIssues.filter(issue => issue.status === 'solved').length;

        setStats({
          pending: pendingCount,
          resolved: resolvedCount,
          notifications: pendingCount // You can modify this based on your notification logic
        });
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Communitifx</h1>
          <p className="mt-2 text-gray-600">
            Explore community issues and government schemes in your area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mt-4 sm:mt-0 mr-2">
              <Button icon={Plus}>
                <Link to='/issues'>
                  Raise a Community Issue
                </Link>
              </Button>
            </div>
          <div className="mt-4 sm:mt-0">
            <Button icon={Plus}>
              <Link to='/schemes'>
                Raise a Government Scheme Issue
              </Link>
            </Button>
          </div>
        </div>
          
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Issues
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.pending}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Resolved Issues
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.resolved}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >


            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg. Resolution Time
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        3.2 days
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      New Notifications
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.notifications}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Issues */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Issues
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {issues.slice(0, 5).map((issue) => (
              <motion.li
                key={issue.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 py-4 sm:px-6 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-2.5 w-2.5 rounded-full ${
                      issue.status === 'solved' ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                    <p className="ml-4 text-sm font-medium text-gray-900">
                      {issue.title}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      issue.status === 'solved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {issue.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {issue.description}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Issues Near You</h2>
            <button
              onClick={() => navigate('/maps')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              View Map
            </button>
          </div>
          <div className="h-[400px] bg-gray-100 rounded-lg">
            <IssueMap issues={issues} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
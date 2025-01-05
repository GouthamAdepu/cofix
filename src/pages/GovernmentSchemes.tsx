import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, MapPin, FileText } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/Button';
import type { Issue } from '../types';

// Add SchemeReportModal component within the same file
function SchemeReportModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedScheme, setSelectedScheme] = useState('');
  const [description, setDescription] = useState('');

  const schemes = [
    'Rythu Bandhu',
    'Kalyana Lakshmi',
    'Aasara pensions',
    'Dalit Bandhu',
    'Rythu Bima',
    'Other Schemes'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/profile/schemes/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: localStorage.getItem('userEmail'),
          benefitType: 'GOVERNMENT_SCHEME',
          issueName: selectedScheme,
          description: description,
          status: 'pending',
          createDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        onClose();
        window.location.reload(); // Refresh to show new scheme
      } else {
        alert('Failed to report scheme issue');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to report scheme issue');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Report Scheme Issue</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Scheme
            </label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a scheme</option>
              {schemes.map((scheme) => (
                <option key={scheme} value={scheme}>
                  {scheme}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
              required
              placeholder="Describe the issue with the scheme..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GovernmentSchemes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schemes, setSchemes] = useState<Issue[]>([]);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/issues?benefitType=GOVERNMENT_SCHEME');
      if (response.ok) {
        const data = await response.json();
        setSchemes(data.map((scheme: any) => ({
          id: scheme.postId.toString(),
          title: scheme.issueName,
          description: scheme.description,
          type: 'government',
          status: scheme.status || 'pending',
          urgency: 'medium',
          location: scheme.location || { lat: 0, lng: 0 },
          createdAt: new Date(scheme.createDate),
          updatedAt: new Date(scheme.createDate),
          userId: scheme.email
        })));
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Government Schemes</h1>
            <p className="mt-2 text-sm text-gray-700">
              Report issues related to government schemes and programs
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setIsModalOpen(true)}
              icon={Plus}
            >
              Report Scheme Issue
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="sm:flex sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option>All Schemes</option>
              <option>Housing</option>
              <option>Education</option>
              <option>Healthcare</option>
              <option>Employment</option>
            </select>
            <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option>All Statuses</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        {/* Schemes List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {schemes.map((scheme, index) => (
              <motion.li
                key={scheme.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      scheme.status === 'solved' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <FileText className={`h-6 w-6 ${
                        scheme.status === 'solved' ? 'text-green-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-medium text-gray-900">{scheme.title}</h2>
                      <p className="text-sm text-gray-500">{scheme.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        scheme.status === 'solved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {scheme.status}
                      </span>
                      <span className="mt-1 text-sm text-gray-500">
                        {new Date(scheme.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>View details</span>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Scheme Report Modal */}
        <SchemeReportModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </DashboardLayout>
  );
}
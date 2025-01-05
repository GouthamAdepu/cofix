import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Clock, AlertTriangle, Edit2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ReportIssueModal from '../components/reportIssuemodel';

interface Notice {
  id: string;
  title: string;
  message: string;
  type: 'update' | 'resolution' | 'alert';
  timestamp: Date;
  read: boolean;
  status?: string;
  location?: { lat: number; lng: number };
  description?: string;
  benefitType?: string;
}

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Notice | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);

  useEffect(() => {
    fetchUserIssues();
  }, []);

  useEffect(() => {
    filterNotices(activeFilter);
  }, [notices, activeFilter]);

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
        console.log("Fetched data:", data); // Debug log
        const formattedNotices = data.map((issue: any) => ({
          id: issue.postId.toString(),
          title: issue.issueName,
          message: issue.description || '',
          type: issue.status === 'solved' ? 'resolution' : 'update',
          timestamp: new Date(issue.createDate),
          read: false,
          status: issue.status,
          location: issue.location,
          description: issue.description,
          benefitType: issue.benefitType || 'COMMUNITY_ISSUE' // Default to community issue if not specified
        }));
        console.log("Formatted notices:", formattedNotices); // Debug log
        setNotices(formattedNotices);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const filterNotices = (filter: string) => {
    console.log("Filtering notices:", filter, notices); // Debug log
    switch (filter) {
      case 'community':
        setFilteredNotices(notices.filter(notice => 
          notice.benefitType === 'COMMUNITY_ISSUE'
        ));
        break;
      case 'government':
        setFilteredNotices(notices.filter(notice => 
          notice.benefitType === 'GOVERNMENT_SCHEME'
        ));
        break;
      default:
        setFilteredNotices(notices);
        break;
    }
  };

  const handleEditIssue = (notice: Notice) => {
    setSelectedIssue(notice);
    setIsEditModalOpen(true);
  };

  const handleUpdateIssue = async (updatedData: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/profile/issues/update/${selectedIssue?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: localStorage.getItem('userEmail'),
          issueName: updatedData.title,
          description: updatedData.description,
          location: updatedData.location,
          status: selectedIssue?.status
        })
      });

      if (response.ok) {
        await fetchUserIssues(); // Refresh the list
        setIsEditModalOpen(false);
      } else {
        alert('Failed to update issue');
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Failed to update issue');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Issues</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track and manage your reported issues
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <button 
              className={`px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${
                activeFilter === 'all' ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              All Issues
            </button>
            <button 
              className={`px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${
                activeFilter === 'community' ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('community')}
            >
              Community Issues
            </button>
            <button 
              className={`px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${
                activeFilter === 'government' ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('government')}
            >
              Government Schemes
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredNotices.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredNotices.map((notice, index) => (
                <motion.li
                  key={notice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        notice.status === 'solved' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {notice.type === 'resolution' && (
                          <CheckCircle className={`h-6 w-6 ${
                            notice.status === 'solved' ? 'text-green-600' : 'text-yellow-600'
                          }`} />
                        )}
                        {notice.type === 'update' && (
                          <Clock className={`h-6 w-6 ${
                            notice.status === 'solved' ? 'text-green-600' : 'text-yellow-600'
                          }`} />
                        )}
                      </div>
                      <div className="ml-4">
                        <h2 className="text-lg font-medium text-gray-900">{notice.title}</h2>
                        <p className="text-sm text-gray-500">{notice.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-end">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          notice.status === 'solved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {notice.status || 'pending'}
                        </span>
                        <span className="mt-1 text-sm text-gray-500">
                          {new Date(notice.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleEditIssue(notice)}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {activeFilter === 'government' ? (
                <p>No government scheme issues reported yet.</p>
              ) : activeFilter === 'community' ? (
                <p>No community issues reported yet.</p>
              ) : (
                <p>No issues reported yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {selectedIssue && (
        <ReportIssueModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateIssue}
          initialData={selectedIssue}
        />
      )}
    </DashboardLayout>
  );
}
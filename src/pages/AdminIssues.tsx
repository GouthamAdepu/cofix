import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, MapPin, AlertCircle, Edit2 } from 'lucide-react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import IssueDetailsModal from '../components/IssueDetailsModal';

interface Issue {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  location: {
    lat: number;
    lng: number;
  };
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: string;
  category: string;
  userEmail: string;
  benefitType: string;
  schemeName: string;
}

export default function AdminIssues() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/issues');
      if (response.ok) {
        const data = await response.json();
        const formattedIssues = data.map((issue: any) => ({
          id: issue.id || issue.postId?.toString(),
          title: issue.title || issue.issueName,
          description: issue.description,
          imageUrl: issue.image ? `data:image/jpeg;base64,${issue.image}` : undefined,
          location: issue.location,
          urgency: issue.urgency?.toLowerCase() || 'medium',
          status: issue.status?.toLowerCase() || 'pending',
          createdAt: issue.createdAt,
          category: issue.category || issue.comment,
          userEmail: issue.userEmail,
          benefitType: issue.benefitType,
          schemeName: issue.schemeName
        }));
        setIssues(formattedIssues);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId: string, newStatus: string) => {
    try {
      const adminEmail = localStorage.getItem('adminEmail');
      if (!adminEmail) {
        console.error('No admin email found');
        return;
      }

      const response = await fetch(`http://localhost:8000/api/admin/issues/update/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminEmail: adminEmail
        })
      });

      if (response.ok) {
        // Refresh issues after update
        fetchIssues();
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleResolveIssue = async (issueId: string, resolution: { description: string; image: File | null }) => {
    setIssues(issues.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status: 'resolved',
          resolution: {
            description: resolution.description,
            imageUrl: resolution.image ? URL.createObjectURL(resolution.image) : '',
            resolvedAt: new Date().toISOString()
          }
        };
      }
      return issue;
    }));
    
    setSelectedIssue(null);
  };

  const filteredIssues = issues.filter(issue => {
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community Issues</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage and resolve community reported issues
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4">
          <div className="sm:flex sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            <select 
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Street Lights">Street Lights</option>
              <option value="Road Problems">Road Problems</option>
              <option value="Drainage Issues">Drainage Issues</option>
              <option value="Water Supply">Water Supply</option>
            </select>
            <select
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredIssues.map((issue) => (
              <motion.li key={issue.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">
                      {issue.benefitType === 'GOVERNMENT_SCHEME' ? `[Scheme] ${issue.title}` : issue.title}
                    </h3>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Reported by: {issue.userEmail} | Created: {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      issue.status === 'solved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {issue.status}
                    </span>
                    <button onClick={() => handleEditIssue(issue)}>
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Issue Details Modal */}
        {selectedIssue && (
          <IssueDetailsModal
            issue={selectedIssue}
            isOpen={!!selectedIssue}
            onClose={() => setSelectedIssue(null)}
            onResolve={handleResolveIssue}
          />
        )}
      </div>
    </AdminDashboardLayout>
  );
} 
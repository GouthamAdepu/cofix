import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, MapPin, AlertCircle, Edit2 } from 'lucide-react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import IssueDetailsModal from '../components/IssueDetailsModal';

// Import marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface Issue {
  id: string;
  title: string;
  description: string;
  image?: string;
  location: {
    lat: number;
    lng: number;
  };
  urgency: 'low' | 'medium' | 'high';
  status: string;
  createdAt: string;
  category: string;
  userEmail: string;
  benefitType: string;
  schemeName: string;
  resolutionDescription?: string;
  resolutionImage?: string;
}

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function AdminIssues() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [resolutionDesc, setResolutionDesc] = useState('');
  const [resolutionImg, setResolutionImg] = useState<File | null>(null);

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
          image: issue.image ? `data:image/jpeg;base64,${issue.image}` : undefined,
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

  const handleResolveIssue = async (issueId: number) => {
    try {
      const formData = new FormData();
      formData.append('resolutionDescription', resolutionDesc);
      if (resolutionImg) {
        formData.append('resolutionImage', resolutionImg);
      }

      const response = await fetch(
        `http://localhost:8000/api/admin/issues/${issueId}/resolve`,
        {
          method: 'PUT',
          body: formData,
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const updatedIssue = await response.json();

      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue.id === issueId.toString() ? {
            ...issue,
            status: 'resolved',
            resolutionDescription: updatedIssue.resolutionDescription,
            resolutionImage: updatedIssue.resolutionImage
          } : issue
        )
      );
      
      setSelectedIssue(null);
      setResolutionDesc('');
      setResolutionImg(null);
    } catch (error) {
      console.error('Error resolving issue:', error);
    }
  };

  const handleEditIssue = (issue: Issue) => {
    setSelectedIssue(issue);
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedIssue.title}</h2>
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Issue Details */}
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{selectedIssue.description}</p>
                </div>

                {/* Issue Image */}
                {selectedIssue.image && (
                  <div>
                    <h3 className="font-semibold mb-2">Issue Image</h3>
                    <img 
                      src={`data:image/jpeg;base64,${selectedIssue.image}`}
                      alt="Issue" 
                      className="rounded-lg max-h-64 object-cover w-full"
                    />
                  </div>
                )}

                {/* Location Map */}
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <div className="h-64 rounded-lg overflow-hidden">
                    <MapContainer
                      center={[selectedIssue.location.lat, selectedIssue.location.lng]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Marker position={[selectedIssue.location.lat, selectedIssue.location.lng]}>
                        <Popup>
                          Issue Location<br/>
                          {selectedIssue.title}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>

                {/* Resolution Form */}
                {selectedIssue.status.toLowerCase() !== 'resolved' && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Resolve Issue</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resolution Description
                        </label>
                        <textarea
                          className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                          value={resolutionDesc}
                          onChange={(e) => setResolutionDesc(e.target.value)}
                          placeholder="Describe how the issue was resolved..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Resolution Image (Optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setResolutionImg(e.target.files?.[0] || null)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                          onClick={() => setSelectedIssue(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          onClick={() => {
                            if (resolutionDesc.trim()) {
                              handleResolveIssue(Number(selectedIssue.id));
                            } else {
                              alert('Please provide a resolution description');
                            }
                          }}
                        >
                          Mark as Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show Resolution Details if already resolved */}
                {selectedIssue.status.toLowerCase() === 'resolved' && selectedIssue.resolutionDescription && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Resolution Details</h3>
                    <p className="text-gray-600">{selectedIssue.resolutionDescription}</p>
                    {selectedIssue.resolutionImage && (
                      <div>
                        <h3 className="font-semibold mb-2">Resolution Image</h3>
                        <img 
                          src={`data:image/jpeg;base64,${selectedIssue.resolutionImage}`}
                          alt="Resolution" 
                          className="mt-2 rounded-lg max-h-64 object-cover w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
} 
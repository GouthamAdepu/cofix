import React, { useState } from 'react';
import { X, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Button from './Button';

interface IssueDetailsModalProps {
  issue: {
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
    benefitType: string;
    schemeName: string;
    image: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onResolve: (issueId: string, resolution: { description: string; image: File | null }) => void;
}

export default function IssueDetailsModal({ issue, isOpen, onClose, onResolve }: IssueDetailsModalProps) {
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolution, setResolution] = useState({
    description: '',
    image: null as File | null
  });

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResolution(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmitResolution = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(issue.id, resolution);
    setShowResolutionForm(false);
    setResolution({ description: '', image: null });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">{issue.title}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  issue.urgency === 'high' ? 'bg-red-100 text-red-800' :
                  issue.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {issue.urgency}
                </span>
                <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                  {issue.category}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Reported on {new Date(issue.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Description */}
            <div className="space-y-4">
              {issue.benefitType === 'GOVERNMENT_SCHEME' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Scheme Name</h4>
                  <p className="mt-1 text-sm text-gray-900">{issue.schemeName}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Type</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {issue.benefitType === 'GOVERNMENT_SCHEME' ? 'Government Scheme' : 'Community Issue'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1 text-sm text-gray-900">{issue.description}</p>
              </div>

              {issue.image && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Image</h4>
                  <img 
                    src={`data:image/jpeg;base64,${issue.image}`} 
                    alt="Issue" 
                    className="mt-1 h-48 w-full object-cover rounded-md"
                  />
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className={`mt-1 text-sm ${
                  issue.status.toLowerCase() === 'solved' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {issue.status}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(issue.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Map */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Location</h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <MapContainer
                  center={[issue.location.lat, issue.location.lng]}
                  zoom={13}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[issue.location.lat, issue.location.lng]}>
                    <Popup>{issue.title}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Resolution Form */}
            {issue.status !== 'resolved' && (
              <div className="border-t pt-6">
                {!showResolutionForm ? (
                  <Button
                    onClick={() => setShowResolutionForm(true)}
                    icon={CheckCircle}
                    fullWidth
                  >
                    Mark as Resolved
                  </Button>
                ) : (
                  <form onSubmit={handleSubmitResolution} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resolution Details
                      </label>
                      <textarea
                        value={resolution.description}
                        onChange={(e) => setResolution(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resolution Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="secondary"
                        onClick={() => setShowResolutionForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        Submit Resolution
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../components/DashboardLayout';
import { FileText } from 'lucide-react';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapIssue {
  id: string;
  title: string;
  description: string;
  status: string;
  location: { lat: number; lng: number };
  createdAt: Date;
  benefitType: string;
  email: string;
}

export default function Maps() {
  const [issues, setIssues] = useState<MapIssue[]>([]);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([17.455598622434977, 78.66648576707394]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Get user's current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    fetchAllIssues();
  }, []);

  const fetchAllIssues = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/issues/all');
      const data = await response.json();
      
      if (response.ok) {
        console.log('Fetched issues:', data);
        const formattedIssues = data.map((issue: any) => ({
          id: issue.postId?.toString() || issue.id?.toString() || Math.random().toString(),
          title: issue.issueName || issue.title || 'Untitled Issue',
          description: issue.description || '',
          status: issue.status || 'pending',
          location: {
            lat: issue.latitude || 17.455598622434977,
            lng: issue.longitude || 78.66648576707394
          },
          createdAt: new Date(issue.createDate || issue.createdAt || new Date()),
          benefitType: issue.benefitType || 'COMMUNITY_ISSUE',
          email: issue.email || issue.userEmail || 'anonymous'
        }));
        console.log('Formatted issues:', formattedIssues);
        setIssues(formattedIssues);
      } else {
        console.error('Failed to fetch issues:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const filteredIssues = activeFilter === 'all' 
    ? issues 
    : issues.filter(issue => issue.benefitType === activeFilter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Community Issues Map</h1>
            <p className="mt-2 text-sm text-gray-700">
              View all reported issues in your area
            </p>
          </div>
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
                activeFilter === 'COMMUNITY_ISSUE' ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('COMMUNITY_ISSUE')}
            >
              Community Issues
            </button>
            <button 
              className={`px-3 py-2 text-sm font-medium text-gray-700 rounded-md ${
                activeFilter === 'GOVERNMENT_SCHEME' ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setActiveFilter('GOVERNMENT_SCHEME')}
            >
              Government Schemes
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="h-[600px]">
            <MapContainer
              center={currentLocation}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Issue markers */}
              {filteredIssues.map((issue) => (
                issue.location && (
                  <Marker
                    key={issue.id}
                    position={[issue.location.lat, issue.location.lng]}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{issue.title}</h3>
                        <p className="text-sm text-gray-600">{issue.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            issue.status === 'solved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {issue.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
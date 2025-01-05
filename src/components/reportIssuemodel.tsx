import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin } from 'lucide-react';
import Button from './Button';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issueData: any) => void;
  initialData?: any;
}

function LocationMarker({ position, setPosition }: any) {
  const map = useMap();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPosition = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          };
          setPosition(newPosition);
          map.setView([newPosition.lat, newPosition.lng], map.getZoom());
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return (
    <>
      {position && (
        <>
          <Marker position={position} />
          <CircleMarker 
            center={[position.lat, position.lng]}
            radius={20}
            pathOptions={{
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.3
            }}
          />
        </>
      )}
    </>
  );
}

export default function ReportIssueModal({ isOpen, onClose, onSubmit, initialData }: ReportIssueModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    urgency: 'medium',
    location: { lat: 0, lng: 0 },
    photo: null as File | null,
  });
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.message,
        urgency: 'medium',
        location: initialData.location || { lat: 0, lng: 0 },
        photo: null,
      });
      if (initialData.location) {
        setPosition(initialData.location);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          setPosition({
            lat: location.coords.latitude,
            lng: location.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(files => files.filter((_, i) => i !== index));
    setPreviewUrls(urls => urls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!position) {
      alert('Please select a location on the map');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', 'COMMUNITY_ISSUE');
    formDataToSend.append('urgency', formData.urgency);
    formDataToSend.append('latitude', position.lat.toString());
    formDataToSend.append('longitude', position.lng.toString());
    formDataToSend.append('userEmail', localStorage.getItem('userEmail') || '');

    // Add multiple images to form data
    selectedFiles.forEach(file => {
      formDataToSend.append('images', file);
    });

    try {
      const response = await fetch('http://localhost:8000/api/issues/report', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        // Cleanup preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        onSubmit(formData);
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to report issue');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to report issue');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Report Issue</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Issue Title</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-800 shadow focus:border-indigo-500 focus:ring-indigo-500 p-2"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-800 shadow focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Urgency</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow focus:border-indigo-500 focus:ring-indigo-500 p-3"
                value={formData.urgency}
                onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <div className="mt-1 h-[300px] rounded-md overflow-hidden">
                <MapContainer
                  center={position || [17.455598622434977, 78.66648576707394]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {position ? 
                  "Click on the map to change location" : 
                  "Getting your current location..."}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Photo</label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                  onChange={handlePhotoChange}
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="h-8 w-8 mr-2" />
                  Upload Photo
                </label>
              </div>
              {previewUrl && (
                <div className="mt-2">
                  <img src={previewUrl} alt="Preview" className="h-32 w-32 object-cover rounded-md" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleImages}
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </div>

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1
                          opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Submit Issue
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
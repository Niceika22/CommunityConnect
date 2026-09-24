import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function SeekerDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Request State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Plumber');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('MEDIUM');

  const [reqLat, setReqLat] = useState('');
  const [reqLng, setReqLng] = useState('');
  const [locStatus, setLocStatus] = useState('');
  
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Socket setup for real-time request updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token }
    });

    socket.on('request_updated', (updatedRequest) => {
      setRequests(prev => prev.map(r => r._id === updatedRequest._id ? updatedRequest : r));
      toast.success(`Request "${updatedRequest.title}" updated!`);
    });

    return () => socket.disconnect();
  }, []);

  // Pre-fill if user has location
  useEffect(() => {
    if (user && user.location && user.location.coordinates && user.location.coordinates.length >= 2) {
      setReqLng(user.location.coordinates[0]);
      setReqLat(user.location.coordinates[1]);
    }
  }, [user]);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get('/requests/my-requests');
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('Geolocation is not supported by your browser');
    } else {
      setLocStatus('Locating...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setReqLat(position.coords.latitude);
          setReqLng(position.coords.longitude);
          setLocStatus('Location captured!');
        },
        () => {
          setLocStatus('Your location is required to find nearby helpers. Please allow location access or enter your location manually.');
        }
      );
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!reqLat || !reqLng) {
      return toast.error('Your location is required to find nearby helpers.');
    }
    
    setIsSubmitting(true);
    try {
      const res = await axios.post('/requests', {
        title, category, description, urgency, latitude: reqLat, longitude: reqLng
      });

      setRequests([res.data, ...requests]);
      setShowModal(false);
      toast.success('Help request created successfully!');
      
      // Clear form
      setTitle('');
      setDescription('');
      
      const provRes = await axios.get(`/requests/nearby-providers?latitude=${reqLat}&longitude=${reqLng}&category=${category}`);
      setNearbyProviders(provRes.data);
      
    } catch (err) {
      // Error handled by global interceptor, but we can stop submitting
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${classes[status] || classes.PENDING}`}>{status}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
          {user?.location?.coordinates && user.location.coordinates.length === 2 && (user.location.coordinates[0] !== 0 || user.location.coordinates[1] !== 0) ? (
            <p className="text-gray-500 flex items-center mt-1">
              <MapPin size={16} className="mr-1" />
              Your Location: {user.location.coordinates[1].toFixed(4)}, {user.location.coordinates[0].toFixed(4)}
            </p>
          ) : (
            <p className="text-yellow-600 text-sm mt-1">Location not set. Please update when requesting help.</p>
          )}
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" /> Request Help
        </button>
      </div>

      {nearbyProviders.length > 0 && (
        <div className="mb-10 bg-green-50 border border-green-200 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-green-800 mb-4">Nearby Providers Found!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyProviders.map(p => (
              <div key={p._id} className="bg-white p-4 rounded shadow-sm border border-green-100">
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{p.providerDetails?.serviceCategory}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-yellow-500 font-bold">★ {p.providerDetails?.rating || 'New'}</span>
                  <button onClick={() => setSelectedProvider(p)} className="text-blue-600 hover:underline">View Profile</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button onClick={() => setSelectedProvider(null)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <XCircle size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedProvider.name}</h2>
            <p className="text-blue-600 font-medium mb-4">{selectedProvider.providerDetails?.serviceCategory}</p>
            
            <div className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded border">
              <p><strong>Status:</strong> {selectedProvider.providerDetails?.verified ? <span className="text-green-600">Verified Provider ✓</span> : 'Unverified'}</p>
              <p><strong>Rating:</strong> ★ {selectedProvider.providerDetails?.rating || 'No ratings yet'} ({selectedProvider.providerDetails?.reviewsCount || 0} reviews)</p>
              <p><strong>Experience:</strong> {selectedProvider.providerDetails?.experience || 'Not specified'}</p>
              <p><strong>Skills:</strong> {selectedProvider.providerDetails?.skills?.join(', ') || 'Not specified'}</p>
              <p><strong>Jobs Completed:</strong> {selectedProvider.providerDetails?.completedRequests || 0}</p>
              <p><strong>Contact:</strong> {selectedProvider.phone}</p>
            </div>
            <button onClick={() => setSelectedProvider(null)} className="mt-6 w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 transition">
              Close
            </button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-gray-500">
          No requests found. Create one to get started!
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{req.title}</h3>
                  {getStatusBadge(req.status)}
                  {req.urgency === 'EMERGENCY' && <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">URGENT</span>}
                </div>
                <p className="text-gray-600 text-sm mb-2">{req.description}</p>
                <p className="text-xs text-gray-500 font-medium">Category: {req.category}</p>
                {req.provider && (
                  <p className="text-sm text-blue-600 mt-2">
                    Assigned to: {req.provider.name} ({req.provider.phone})
                  </p>
                )}
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                {req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS' ? (
                  <button onClick={() => navigate(`/chat/${req._id}`)} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Chat</button>
                ) : null}
                {req.status === 'COMPLETED' ? (
                  <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-50">Review Provider</button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">New Help Request</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required type="text" className="w-full border p-2 rounded" value={title} onChange={e=>setTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select className="w-full border p-2 rounded" value={category} onChange={e=>setCategory(e.target.value)}>
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Elderly assistance">Elderly assistance</option>
                  <option value="Medical assistance">Medical assistance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required className="w-full border p-2 rounded" rows="3" value={description} onChange={e=>setDescription(e.target.value)}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Urgency</label>
                <select className="w-full border p-2 rounded" value={urgency} onChange={e=>setUrgency(e.target.value)}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
              
              <div className="bg-gray-50 p-4 rounded border">
                <div className="flex justify-between items-center mb-2">
                   <label className="block text-sm font-medium text-gray-700">Service Location</label>
                   <button type="button" onClick={handleGetLocation} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                     Update My Location
                   </button>
                </div>
                {locStatus && <p className="text-xs text-red-500 mb-2">{locStatus}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500">Latitude</label>
                    <input type="number" step="any" className="w-full border p-2 rounded text-sm" value={reqLat} onChange={e=>setReqLat(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">Longitude</label>
                    <input type="number" step="any" className="w-full border p-2 rounded text-sm" value={reqLng} onChange={e=>setReqLng(e.target.value)} required />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                {isSubmitting ? 'Posting...' : 'Post Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin } from 'lucide-react';

import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

export default function ProviderDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Real-time socket
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token }
    });

    socket.on('request_updated', (updatedRequest) => {
      // If a nearby request got accepted by someone else, remove it
      if (updatedRequest.status !== 'PENDING') {
        setNearbyRequests(prev => prev.filter(r => r._id !== updatedRequest._id));
      }
      
      // Update active jobs if it's our job
      setActiveJobs(prev => {
        const isOurs = prev.some(job => job._id === updatedRequest._id);
        if (isOurs) {
           return prev.map(job => job._id === updatedRequest._id ? updatedRequest : job);
        }
        return prev;
      });
    });

    socket.on('new_nearby_request', (newRequest) => {
      setNearbyRequests(prev => {
        if (!prev.some(r => r._id === newRequest._id)) {
          toast('New nearby help request available', { icon: '📍' });
          return [newRequest, ...prev];
        }
        return prev;
      });
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchNearbyRequests();
    fetchActiveJobs();
  }, []);

  const fetchNearbyRequests = async () => {
    try {
      const res = await axios.get('/requests/nearby-requests');
      setNearbyRequests(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchActiveJobs = async () => {
    try {
      const res = await axios.get('/requests/provider-jobs');
      setActiveJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      await axios.put(`/requests/${id}/status`, { status: 'ACCEPTED' });
      setNearbyRequests(nearbyRequests.filter(r => r._id !== id));
      fetchActiveJobs();
      toast.success('Request accepted successfully!');
    } catch (err) {
      // Handled by global interceptor
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    setProcessingId(id);
    try {
      await axios.put(`/requests/${id}/reject`);
      setNearbyRequests(nearbyRequests.filter(r => r._id !== id));
      toast.success('Request rejected');
    } catch (err) {
      // Handled by global interceptor
    } finally {
      setProcessingId(null);
    }
  };

  const [verifying, setVerifying] = useState(false);
  const handleVerifyProfile = async () => {
    setVerifying(true);
    try {
      await axios.post('/users/request-verification');
      // Update local user state if possible, or just show success
      toast.success('Verification request sent to admin!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      // Global toast handles error
    } finally {
      setVerifying(false);
    }
  };

  const [locStatus, setLocStatus] = useState('');

  const hasLocation = user?.location?.coordinates && user.location.coordinates.length === 2 && (user.location.coordinates[0] !== 0 || user.location.coordinates[1] !== 0);

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('Geolocation is not supported by your browser');
    } else {
      setLocStatus('Locating...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await axios.put('/users/profile', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            setLocStatus('Location updated successfully! Refreshing...');
            window.location.reload();
          } catch (err) {
            setLocStatus('Failed to update location in profile.');
          }
        },
        () => {
          setLocStatus('Permission denied. Please allow location access in your browser.');
        }
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Provider Dashboard</h1>
        {hasLocation ? (
          <p className="text-gray-500 flex items-center mt-1">
            <MapPin size={16} className="mr-1" />
            Finding jobs near: {user.location.coordinates[1].toFixed(4)}, {user.location.coordinates[0].toFixed(4)}
          </p>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mt-4">
            <p className="text-yellow-800 font-medium mb-2">Your location is not set. Please update your profile and allow location access to find nearby requests.</p>
            <button onClick={handleUpdateLocation} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">Set My Location</button>
            {locStatus && <p className="text-sm text-yellow-700 mt-2">{locStatus}</p>}
          </div>
        )}
        
        {user?.providerDetails && !user.providerDetails.verified && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded mt-4 flex justify-between items-center">
            <div>
              <p className="text-blue-800 font-medium">Your profile is unverified.</p>
              <p className="text-blue-600 text-sm">Verified providers are trusted more by seekers.</p>
            </div>
            {user.providerDetails.verificationRequested ? (
               <span className="text-blue-800 font-medium bg-blue-200 px-3 py-1 rounded">Verification Pending</span>
            ) : (
              <button 
                onClick={handleVerifyProfile} 
                disabled={verifying}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {verifying ? 'Verifying...' : 'Verify Profile'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Active Jobs</h2>
        {activeJobs.length === 0 ? (
          <div className="bg-white p-6 rounded shadow-sm text-gray-500 text-center">
            You don't have any active jobs right now. Accept a request below to get started!
          </div>
        ) : (
          <div className="grid gap-4">
            {activeJobs.map(job => (
              <div key={job._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{job.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Seeker: {job.seeker?.name}</p>
                  <p className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded inline-block">{job.status}</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <button onClick={() => navigate(`/chat/${job._id}`)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Open Chat</button>
                  {job.status !== 'COMPLETED' && (
                     <button onClick={() => axios.put(`/requests/${job._id}/status`, { status: 'COMPLETED' }).then(()=>fetchActiveJobs())} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Mark Complete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Nearby Help Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : nearbyRequests.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-gray-500">
          No new requests in your area at the moment. We'll notify you when someone needs help!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyRequests.map(req => (
            <div key={req._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{req.title}</h3>
                  {req.urgency === 'EMERGENCY' && <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">URGENT</span>}
                </div>
                <p className="text-sm text-blue-600 font-medium mb-3">{req.category}</p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{req.description}</p>
                <div className="bg-gray-50 p-3 rounded mb-4 text-sm text-gray-700">
                  <p><span className="font-semibold">Seeker:</span> {req.seeker?.name}</p>
                  <p><span className="font-semibold">Time:</span> {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleAccept(req._id)}
                  disabled={processingId === req._id}
                  className="flex-1 bg-green-600 text-white py-2 rounded font-medium hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {processingId === req._id ? '...' : 'Accept'}
                </button>
                <button 
                  onClick={() => handleReject(req._id)}
                  disabled={processingId === req._id}
                  className="flex-1 bg-red-100 text-red-700 py-2 rounded font-medium hover:bg-red-200 disabled:opacity-50 transition"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

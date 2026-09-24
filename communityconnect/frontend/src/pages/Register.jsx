import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, MapPin } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'HELP_SEEKER'
  });
  const [providerDetails, setProviderDetails] = useState({
    serviceCategory: 'Plumber', experience: '', skills: ''
  });
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
    } else {
      setLocationStatus('Locating...');
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationStatus('Location captured!');
      }, () => {
        setLocationStatus('Unable to retrieve your location');
        // Fallback dummy location for testing if denied
        setLocation({ lat: 28.6139, lng: 77.2090 }); // New Delhi
      });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsSubmitting(true);
    try {
      setError('');
      const payload = {
        ...formData,
        latitude: location.lat,
        longitude: location.lng
      };

      if (formData.role === 'SERVICE_PROVIDER') {
        payload.providerDetails = {
          ...providerDetails,
          skills: providerDetails.skills.split(',').map(s => s.trim())
        };
      }

      const res = await axios.post('/auth/register', payload);
      const { token, ...userData } = res.data;
      login(userData, token);
      
      if (userData.role === 'HELP_SEEKER') navigate('/seeker-dashboard');
      else if (userData.role === 'SERVICE_PROVIDER') navigate('/provider-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-10">
      <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-600 p-3 rounded-full text-white mb-2">
            <UserPlus size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Join CommunityConnect</h2>
        </div>
        
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" required className="w-full border p-2 rounded" 
                     onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" required className="w-full border p-2 rounded"
                     onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" required className="w-full border p-2 rounded"
                     onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select className="w-full border p-2 rounded" 
                      onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="HELP_SEEKER">Help Seeker</option>
                <option value="SERVICE_PROVIDER">Service Provider / Volunteer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" required className="w-full border p-2 rounded"
                     onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input type="password" required className="w-full border p-2 rounded"
                     onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
            </div>
          </div>

          {formData.role === 'SERVICE_PROVIDER' && (
            <div className="bg-gray-100 p-4 rounded mt-4 space-y-3">
              <h3 className="font-semibold text-gray-700">Provider Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Category</label>
                <select className="w-full border p-2 rounded"
                        onChange={e => setProviderDetails({...providerDetails, serviceCategory: e.target.value})}>
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Elderly assistance">Elderly assistance</option>
                  <option value="Medical assistance">Medical assistance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience (e.g. 5 years)</label>
                <input type="text" className="w-full border p-2 rounded"
                       onChange={e => setProviderDetails({...providerDetails, experience: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                <input type="text" className="w-full border p-2 rounded" placeholder="Pipe repair, Leak fix"
                       onChange={e => setProviderDetails({...providerDetails, skills: e.target.value})} />
              </div>
            </div>
          )}

          <div className="mt-4">
            <button type="button" onClick={handleLocation} className="flex items-center text-blue-600 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50">
              <MapPin size={18} className="mr-2" /> Get My Location
            </button>
            <p className="text-xs text-gray-500 mt-1">{locationStatus}</p>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white font-medium py-2 rounded hover:bg-green-700 disabled:opacity-50 transition">
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

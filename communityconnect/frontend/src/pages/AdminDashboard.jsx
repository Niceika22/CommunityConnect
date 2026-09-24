import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Activity, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, reqRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/users'),
        axios.get('/admin/requests')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewUser = async (id) => {
    setLoadingUser(true);
    try {
      const res = await axios.get(`/admin/users/${id}`);
      setSelectedUser(res.data.user);
      setUserStats(res.data.stats);
    } catch (err) {
      toast.error('Error fetching user details');
    } finally {
      setLoadingUser(false);
    }
  };

  const verifyProvider = async (id) => {
    try {
      await axios.put(`/admin/providers/${id}/verify`);
      fetchData(); // refresh data
    } catch (err) {
      alert('Error verifying provider');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700 font-bold text-xl">Admin Panel</div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('stats')} className={`block w-full text-left px-4 py-2 rounded ${activeTab === 'stats' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('users')} className={`block w-full text-left px-4 py-2 rounded ${activeTab === 'users' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Users</button>
          <button onClick={() => setActiveTab('providers')} className={`block w-full text-left px-4 py-2 rounded ${activeTab === 'providers' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Providers</button>
          <button onClick={() => setActiveTab('requests')} className={`block w-full text-left px-4 py-2 rounded ${activeTab === 'requests' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Requests</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 capitalize">{activeTab}</h1>

        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
              <h3 className="text-gray-500 font-medium">Total Users</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
              <div className="mt-2 text-sm text-gray-500">Seekers: {stats.seekers} | Providers: {stats.providers}</div>
            </div>
            <div className="bg-white p-6 rounded shadow border-t-4 border-yellow-500">
              <h3 className="text-gray-500 font-medium">Pending Requests</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.pendingRequests}</p>
            </div>
            <div className="bg-white p-6 rounded shadow border-t-4 border-green-500">
              <h3 className="text-gray-500 font-medium">Active & Completed</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.activeRequests + stats.completedRequests}</p>
            </div>
            <div className="bg-white p-6 rounded shadow border-t-4 border-red-500">
              <h3 className="text-gray-500 font-medium">Emergency Requests</h3>
              <p className="text-3xl font-bold text-gray-800">{stats.emergencyRequests}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'SERVICE_PROVIDER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewUser(u._id)}>
                      {loadingUser ? '...' : 'View'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.filter(u => u.role === 'SERVICE_PROVIDER').map(u => (
                  <tr key={u._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.providerDetails?.serviceCategory}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.providerDetails?.verified ? (
                        <span className="text-green-600 flex items-center"><CheckCircle size={16} className="mr-1"/> Yes</span>
                      ) : (
                        <span className="text-red-500 flex items-center"><ShieldAlert size={16} className="mr-1"/> No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {!u.providerDetails?.verified && (
                        <button onClick={async () => {
                          try {
                            await verifyProvider(u._id);
                            toast.success('Provider verified successfully');
                          } catch (err) {}
                        }} className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200">Verify</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seeker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map(req => (
                  <tr key={req._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{req.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{req.seeker?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{req.provider?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{req.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button onClick={async () => {
                        if (confirm('Are you sure you want to delete this request?')) {
                          try {
                            await axios.delete(`/admin/requests/${req._id}`);
                            toast.success('Request removed');
                            fetchData();
                          } catch (err) {
                            // global toast will handle error
                          }
                        }
                      }} className="text-red-600 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">User Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                </div>
              </div>

              {selectedUser.role === 'SERVICE_PROVIDER' && selectedUser.providerDetails && (
                <div className="bg-gray-50 p-4 rounded mt-4">
                  <h3 className="font-bold text-gray-700 mb-2">Provider Info</h3>
                  <p className="text-sm"><strong>Category:</strong> {selectedUser.providerDetails.serviceCategory}</p>
                  <p className="text-sm"><strong>Verified:</strong> {selectedUser.providerDetails.verified ? 'Yes' : 'No'}</p>
                  <p className="text-sm"><strong>Rating:</strong> {selectedUser.providerDetails.rating} ({selectedUser.providerDetails.reviewsCount} reviews)</p>
                  <p className="text-sm mt-1"><strong>Skills:</strong> {selectedUser.providerDetails.skills?.join(', ') || 'None'}</p>
                </div>
              )}

              {userStats && (
                <div className="bg-blue-50 p-4 rounded mt-4">
                  <h3 className="font-bold text-blue-800 mb-2">Platform Activity</h3>
                  {selectedUser.role === 'HELP_SEEKER' ? (
                    <>
                      <p className="text-sm text-blue-900"><strong>Requests Created:</strong> {userStats.requestsCreated}</p>
                      <p className="text-sm text-blue-900"><strong>Requests Completed:</strong> {userStats.requestsCompleted}</p>
                    </>
                  ) : selectedUser.role === 'SERVICE_PROVIDER' ? (
                    <>
                      <p className="text-sm text-blue-900"><strong>Jobs Assigned:</strong> {userStats.jobsAssigned}</p>
                      <p className="text-sm text-blue-900"><strong>Jobs Completed:</strong> {userStats.jobsCompleted}</p>
                    </>
                  ) : (
                    <p className="text-sm text-blue-900">Admin Account</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedUser(null)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

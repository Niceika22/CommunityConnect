import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { HeartHandshake, LogOut, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const token = localStorage.getItem('token');
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on('new_notification', (notif) => {
      setUnreadCount(prev => prev + 1);
      setNotifications(prev => [notif, ...prev]);
      toast(notif.title + '\n' + notif.message, { icon: '🔔' });
    });

    fetchNotifications();

    return () => newSocket.disconnect();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        axios.get('/notifications/unread-count'),
        axios.get('/notifications')
      ]);
      setUnreadCount(countRes.data.count);
      setNotifications(listRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setShowNotifications(false);
    if (!notif.read) {
      try {
        await axios.put(`/notifications/${notif._id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch (err) {
        console.error(err);
      }
    }
    
    // Navigate based on type
    if (notif.relatedId) {
       if (notif.type === 'NEW_MESSAGE') {
          navigate(`/chat/${notif.relatedId}`); // relatedId is request id in message now? Wait, in messageController relatedId is message._id. No, relatedId in chat is requestId!
       } else if (notif.type.includes('REQUEST')) {
          navigate(getDashboardLink());
       }
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'HELP_SEEKER') return '/seeker-dashboard';
    if (user.role === 'SERVICE_PROVIDER') return '/provider-dashboard';
    if (user.role === 'ADMIN') return '/admin-dashboard';
    return '/';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex items-center">
              <HeartHandshake size={28} className="mr-2" />
              <span className="font-bold text-xl tracking-tight">CommunityConnect</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/emergency" className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold">
                  EMERGENCY
                </Link>
                <div className="relative cursor-pointer">
                  <div onClick={() => setShowNotifications(!showNotifications)} className="relative p-1">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
                      <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
                        <h3 className="font-semibold text-gray-700">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n._id} onClick={() => handleNotificationClick(n)} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${n.read ? 'opacity-70' : 'bg-blue-50'}`}>
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm text-gray-800">{n.title}</span>
                                {!n.read && <span className="h-2 w-2 bg-blue-600 rounded-full"></span>}
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{n.message}</p>
                              <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <span className="font-medium text-sm border-l pl-4 border-blue-400">Hi, {user.name}</span>
                <button onClick={handleLogout} className="text-blue-100 hover:text-white flex items-center">
                  <LogOut size={18} className="mr-1"/> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-200">Login</Link>
                <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

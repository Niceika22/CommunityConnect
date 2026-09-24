import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { Send, ArrowLeft } from 'lucide-react';

export default function Chat() {
  const { requestId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [requestDetails, setRequestDetails] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token }
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join_request_room', requestId);

      socket.on('receive_message', (msg) => {
        setMessages((prev) => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      });
    }

    return () => {
      if (socket) socket.off('receive_message');
    }
  }, [socket, user, requestId]);

  useEffect(() => {
    fetchChatData();
  }, [requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
    try {
      const [reqRes, msgRes] = await Promise.all([
        axios.get(`/requests/${requestId}`),
        axios.get(`/messages/${requestId}`)
      ]);
      setRequestDetails(reqRes.data);
      setMessages(msgRes.data);
    } catch (err) {
      console.error(err);
      alert('Error loading chat');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !requestDetails) return;

    const receiverId = user.role === 'HELP_SEEKER' ? requestDetails.provider._id : requestDetails.seeker._id;

    try {
      setNewMessage('');
      await axios.post('/messages', {
        requestId,
        receiverId,
        content: newMessage
      });
      // The socket receives 'receive_message' from the server and updates state
    } catch (err) {
      console.error(err);
    }
  };

  if (!requestDetails) return <div className="p-8 text-center">Loading chat...</div>;

  const otherUser = user.role === 'HELP_SEEKER' ? requestDetails.provider : requestDetails.seeker;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
      <div className="bg-white p-4 rounded-t-lg shadow border-b flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{otherUser?.name || 'Unknown User'}</h2>
          <p className="text-sm text-gray-500">Request: {requestDetails.title}</p>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto border-x border-gray-200">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isMine = msg.sender._id === user._id;
              return (
                <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-lg p-3 ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border rounded-bl-none shadow-sm'}`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-b-lg shadow border-t">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-blue-700 transition">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import { AuthState, ChatMessage } from '../../types';
import { api } from '../../services/api';

interface AdminChatProps {
  authState: AuthState;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const AdminChat: React.FC<AdminChatProps> = ({ authState, showToast }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadAllMessages = async () => {
    try {
      const data = await api.getMessages();
      if (Array.isArray(data)) {
        setMessages(data);
        // Get unique users who have messaged or received messages (excluding admin)
        const userList = Array.from(new Set(
          data.map(m => m.From_ === 'admin' ? m.To_ : m.From_)
        )).filter(u => u && u !== 'admin' && u !== 'all');
        setUsers(userList);
      }
    } catch (err) {
      console.error('Failed to load admin chats', err);
    }
  };

  useEffect(() => {
    loadAllMessages();
    const interval = setInterval(loadAllMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    setLoading(true);
    try {
      const data = await api.sendMessage(selectedUser, 'admin', input);
      if (data.status === 'success') {
        setInput('');
        await loadAllMessages();
      } else {
        showToast('Failed to send message', 'error');
      }
    } catch (err) {
      showToast('Error sending response', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    const msg = window.prompt('Enter message to broadcast to ALL users:');
    if (!msg) return;
    try {
      const data = await api.sendMessage('all', 'admin', msg);
      if (data.status === 'success') {
        showToast('Broadcast sent successfully', 'success');
        loadAllMessages();
      }
    } catch (err) {
      showToast('Broadcast failed', 'error');
    }
  };

  const currentThread = messages.filter(m => 
    (m.From_ === selectedUser && m.To_ === 'admin') || 
    (m.From_ === 'admin' && m.To_ === selectedUser)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 h-[calc(100vh-10rem)] bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 overflow-hidden animate-fade-in">
      {/* Sidebar - User List */}
      <div className="md:col-span-1 border-r border-gray-light dark:border-gray-700 flex flex-col">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-light dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-dark dark:text-white">Active Chats</h3>
          <button 
            onClick={handleBroadcast}
            className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all"
            title="Broadcast Message"
          >
            <i className="fas fa-bullhorn text-xs"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.length > 0 ? users.map(u => (
            <button
              key={u}
              onClick={() => setSelectedUser(u)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-light dark:border-gray-700 transition-colors ${selectedUser === u ? 'bg-primary-light dark:bg-primary/10 border-r-4 border-r-primary' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold">
                {u.charAt(0)}
              </div>
              <div className="text-left overflow-hidden">
                <div className="font-semibold text-dark dark:text-gray-200 truncate">{u}</div>
                <div className="text-[10px] text-gray uppercase font-bold">Customer</div>
              </div>
            </button>
          )) : (
            <div className="p-8 text-center text-gray text-sm italic">No active conversations.</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="md:col-span-3 flex flex-col bg-gray-50 dark:bg-gray-900/50">
        {selectedUser ? (
          <>
            <div className="p-4 bg-white dark:bg-card-dark border-b border-gray-light dark:border-gray-700 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {selectedUser.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-dark dark:text-white">{selectedUser}</h4>
                <div className="flex items-center gap-1 text-[10px] text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Online
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentThread.map((msg, i) => {
                const isAdmin = msg.From_ === 'admin';
                const time = new Date(msg.DateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={i} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className={`
                      max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm
                      ${isAdmin 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white dark:bg-gray-800 text-dark dark:text-gray-200 rounded-tl-none border border-gray-light dark:border-gray-700'}
                    `}>
                      {msg.Message}
                    </div>
                    <span className="text-[10px] text-gray mt-1 px-1">{time}</span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-card-dark border-t border-gray-light dark:border-gray-700 flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-full outline-none text-sm focus:ring-2 focus:ring-primary dark:text-white"
                placeholder="Type your response..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <i className="fas fa-comments text-3xl opacity-20"></i>
            </div>
            <h3 className="text-xl font-bold text-dark dark:text-gray-300 mb-2">Support Message Center</h3>
            <p className="max-w-xs text-sm">Select a user from the sidebar to view the conversation history and respond to their inquiries.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;

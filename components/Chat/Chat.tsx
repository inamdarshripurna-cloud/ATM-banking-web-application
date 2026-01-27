
import React, { useState, useEffect, useRef } from 'react';
import { AuthState, ChatMessage } from '../../types';
import { api } from '../../services/api';

interface ChatProps {
  authState: AuthState;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const Chat: React.FC<ChatProps> = ({ authState, showToast }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const data = await api.getMessages();
      if (Array.isArray(data)) {
        const filtered = data.filter(m => 
          m.From_ === authState.user?.mobile || 
          m.To_ === authState.user?.mobile || 
          m.To_ === 'all'
        );
        setMessages(filtered);
      }
    } catch (err) {
      console.error('Chat error', err);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [authState]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !authState.user) return;

    setLoading(true);
    try {
      const data = await api.sendMessage('admin', authState.user.mobile, input);
      if (data.status === 'success') {
        setInput('');
        await loadMessages();
      } else {
        showToast('Failed to send message', 'error');
      }
    } catch (err) {
      showToast('Error connecting to support', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white dark:bg-card-dark rounded-3xl shadow-2xl border border-gray-light dark:border-gray-800 overflow-hidden animate-fade-in no-scrollbar">
      {/* Refined Header */}
      <div className="bg-primary px-8 py-5 text-white flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner relative">
            <i className="fas fa-headset"></i>
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-secondary border-2 border-primary rounded-full"></span>
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight leading-none mb-1">Nexus Concierge</h3>
            <div className="flex items-center gap-2 text-white/60 text-[9px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Secure Encryption Active
            </div>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-1.5 rounded-lg border border-white/10 hidden sm:block">
           <span className="text-[10px] text-white/50 uppercase font-black tracking-widest">Client Portal</span>
        </div>
      </div>

      {/* Optimized Message Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-gray-50/30 dark:bg-gray-900/10 scroll-smooth no-scrollbar">
        {messages.length > 0 ? (
          messages.map((msg, i) => {
            const isSent = msg.From_ === authState.user?.mobile;
            const time = new Date(msg.DateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div key={i} className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
                <div className={`
                  max-w-[85%] md:max-w-[65%] px-5 py-3 rounded-2xl md:rounded-[1.25rem] text-sm font-medium shadow-sm
                  ${isSent 
                    ? 'bg-primary text-white rounded-tr-none shadow-primary/10' 
                    : 'bg-white dark:bg-gray-800 text-dark dark:text-gray-200 rounded-tl-none border border-gray-light dark:border-gray-700'}
                `}>
                  {msg.Message}
                </div>
                <span className="text-[9px] text-gray dark:text-gray-500 font-black uppercase tracking-widest mt-2 px-2 opacity-50">{time}</span>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-10 space-y-6">
            <i className="fas fa-comments text-[6rem]"></i>
            <div className="text-center">
              <p className="text-xl font-black uppercase tracking-tight">Terminal Ready</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Submit inquiry below</p>
            </div>
          </div>
        )}
      </div>

      {/* Minimal Input Area */}
      <form onSubmit={handleSend} className="p-6 bg-white dark:bg-card-dark border-t border-gray-light dark:border-gray-800 flex gap-4 items-end shrink-0">
        <div className="flex-1">
           <textarea
            rows={1}
            className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-light dark:border-gray-700 focus:border-primary rounded-2xl outline-none text-sm font-medium dark:text-white transition-all shadow-inner resize-none min-h-[50px] flex items-center"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50 text-lg shrink-0 active:scale-95"
        >
          <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
        </button>
      </form>
    </div>
  );
};

export default Chat;

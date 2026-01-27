
import React, { useState } from 'react';
import { api } from '../../services/api';
import { AuthState } from '../../types';

interface AdminLoginProps {
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  setCurrentScreen: React.Dispatch<React.SetStateAction<any>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ setAuthState, setCurrentScreen, showToast }) => {
  // Initialized to empty strings for manual entry
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return showToast('Credentials required', 'error');

    setLoading(true);
    try {
      // API expects 'username' as the key
      const data = await api.adminLogin(email, password);
      if (data.status === 'success') {
        setAuthState({
          user: null,
          sessionId: data.session_id,
          isAdmin: true,
        });
        localStorage.setItem('adminSessionId', data.session_id);
        setCurrentScreen('admin-app');
        showToast('Admin access granted', 'success');
      } else {
        showToast(data.message || 'Unauthorized access: Admin not found', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden p-10 animate-fade-in border border-primary/30 ring-1 ring-white/10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary/20 mb-6 border border-primary/40 shadow-inner">
          <i className="fas fa-user-shield text-primary text-3xl"></i>
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Command Center</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 opacity-60">Nexus Bank Admin Access</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Admin Email</label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-500 group-focus-within:text-primary transition-colors">
              <i className="fas fa-envelope-open-text"></i>
            </span>
            <input
              type="text"
              autoComplete="off"
              className="w-full pl-12 pr-6 py-4 bg-slate-800/40 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white placeholder-slate-600 font-bold"
              placeholder="Enter Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Admin Password</label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-500 group-focus-within:text-primary transition-colors">
              <i className="fas fa-key"></i>
            </span>
            <input
              type="password"
              className="w-full pl-12 pr-6 py-4 bg-slate-800/40 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white placeholder-slate-600 font-bold"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/30 disabled:opacity-50 uppercase tracking-[0.1em] text-sm flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fas fa-unlock-alt"></i>
                Verify & Enter
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-10 text-center pt-8 border-t border-white/5">
        <button 
          onClick={() => setCurrentScreen('login')} 
          className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center justify-center gap-3 mx-auto"
        >
          <i className="fas fa-chevron-left"></i> 
          Back to Member Login
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;

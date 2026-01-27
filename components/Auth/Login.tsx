
import React, { useState } from 'react';
import { api } from '../../services/api';
import { AuthState } from '../../types';

interface LoginProps {
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  setCurrentScreen: React.Dispatch<React.SetStateAction<any>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const Login: React.FC<LoginProps> = ({ setAuthState, setCurrentScreen, showToast }) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || !password) return showToast('Please fill all fields', 'error');
    
    setLoading(true);
    try {
      const data = await api.login(mobile, password);
      if (data.status === 'success') {
        const userData = await api.getUser(mobile);
        if (userData.status === 'success') {
          setAuthState({
            user: userData.user,
            sessionId: data.session_id,
            isAdmin: false,
          });
          localStorage.setItem('currentUser', JSON.stringify(userData.user));
          localStorage.setItem('sessionId', data.session_id);
          setCurrentScreen('app');
          showToast('Login successful!', 'success');
        } else {
          showToast('Failed to fetch user details', 'error');
        }
      } else {
        showToast(data.message || 'Invalid credentials', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden p-8 animate-fade-in border border-white/10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 border border-primary/30">
          <i className="fas fa-university text-primary text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-white">NexusBank ATM</h2>
        <p className="text-slate-400 text-sm mt-1">Access your account securely</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Number</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
              <i className="fas fa-phone-alt text-sm"></i>
            </span>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white placeholder-slate-500"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Secure PIN / Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
              <i className="fas fa-lock text-sm"></i>
            </span>
            <input
              type="password"
              className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-white placeholder-slate-500"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-spinner fa-spin"></i> Verifying...
            </span>
          ) : 'Login to Account'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
        <button
          onClick={() => setCurrentScreen('admin-login')}
          className="w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 font-bold py-3 rounded-2xl transition-all"
        >
          Admin Portal
        </button>
        <p className="text-center text-slate-400 text-sm">
          New to NexusBank?{' '}
          <button onClick={() => setCurrentScreen('register')} className="text-primary font-bold hover:underline ml-1">
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;

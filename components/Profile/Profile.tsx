
import React, { useState } from 'react';
import { AuthState, User } from '../../types';
import { api } from '../../services/api';

interface ProfileProps {
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const Profile: React.FC<ProfileProps> = ({ authState, setAuthState, showToast }) => {
  const [name, setName] = useState(authState.user?.name || '');
  const [email, setEmail] = useState(authState.user?.email || '');
  const [city, setCity] = useState(authState.user?.city || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user || !authState.sessionId) return;
    setLoading(true);
    try {
      const updateData: Partial<User> = { name, email, city };
      const data = await api.updateProfile(authState.user.mobile, authState.sessionId, updateData);
      if (data.status === 'success') {
        const updatedUser = { ...authState.user, name, email, city };
        setAuthState(prev => ({ ...prev, user: updatedUser }));
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        showToast('Profile information synced', 'success');
      } else {
        showToast(data.message || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user || !authState.sessionId) return;
    if (!password) return showToast('Enter new credentials', 'error');
    if (password !== confirmPassword) return showToast('Credentials do not match', 'error');
    setLoading(true);
    try {
      const data = await api.updateProfile(authState.user.mobile, authState.sessionId, { password });
      if (data.status === 'success') {
        setPassword('');
        setConfirmPassword('');
        showToast('Security credentials updated', 'success');
      } else {
        showToast(data.message || 'Security update failed', 'error');
      }
    } catch (err) {
      showToast('Network timeout', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!authState.user) return null;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="bg-white dark:bg-card-dark rounded-3xl shadow-xl border border-gray-light dark:border-gray-800 overflow-hidden mb-10">
        <div className="h-40 bg-gradient-to-r from-primary to-blue-600 relative">
          <div className="absolute -bottom-10 left-10">
            <div className="w-32 h-32 rounded-3xl bg-white dark:bg-card-dark p-1.5 shadow-2xl ring-4 ring-white dark:ring-gray-800">
              <div className="w-full h-full rounded-2xl bg-primary/10 flex items-center justify-center text-4xl font-black text-primary uppercase">
                {authState.user.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
        <div className="px-10 pt-16 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-dark dark:text-white uppercase tracking-tighter">{authState.user.name}</h2>
            <div className="flex gap-4 text-xs text-gray font-bold uppercase tracking-widest">
              <span>{authState.user.mobile}</span>
              <span className="text-primary">•</span>
              <span>{authState.user.city || 'Nexus Central'}</span>
            </div>
          </div>
          <div className="bg-primary/10 px-6 py-2 rounded-xl border border-primary/20 flex items-center gap-3">
             <i className="fas fa-shield-check text-primary"></i>
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">Platinum Identity Verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white dark:bg-card-dark rounded-3xl shadow-sm border border-gray-light dark:border-gray-800 p-8 md:p-10">
              <h3 className="text-xs font-black text-gray uppercase tracking-[0.3em] border-b border-gray-light dark:border-gray-800 pb-4 mb-8">Management Settings</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-gray uppercase tracking-widest ml-1">Full Name</label>
                       <input
                        type="text"
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-light dark:border-gray-700 rounded-2xl outline-none font-bold dark:text-white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray uppercase tracking-widest ml-1">Email</label>
                       <input
                        type="email"
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-light dark:border-gray-700 rounded-2xl outline-none font-bold dark:text-white"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray uppercase tracking-widest ml-1">Base City</label>
                       <input
                        type="text"
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-light dark:border-gray-700 rounded-2xl outline-none font-bold dark:text-white"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                       />
                    </div>
                 </div>
                 <button type="submit" disabled={loading} className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase text-sm shadow-lg shadow-primary/20">
                   Update Preferences
                 </button>
              </form>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-3xl border border-gray-light dark:border-gray-700">
              <h4 className="text-[10px] font-black text-gray uppercase tracking-widest mb-6">Account Summary</h4>
              <div className="space-y-6">
                 <div className="flex justify-between border-b border-gray-light dark:border-gray-700 pb-3">
                    <span className="text-[10px] font-bold text-gray uppercase">Current Balance</span>
                    <span className="text-sm font-black text-dark dark:text-white">₹{authState.user.balance.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-light dark:border-gray-700 pb-3">
                    <span className="text-[10px] font-bold text-gray uppercase">Vault ID</span>
                    <span className="text-sm font-black text-dark dark:text-white">{authState.user.mobile}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-light dark:border-gray-700 pb-3">
                    <span className="text-[10px] font-bold text-gray uppercase">Verification Level</span>
                    <span className="text-xs font-black text-primary uppercase">Platinum</span>
                 </div>
              </div>
           </div>

           <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <h4 className="text-lg font-black uppercase tracking-tighter mb-4">Nexus Core Security</h4>
              <p className="text-[10px] font-bold text-white/70 leading-relaxed mb-6">
                Your account is under proactive monitoring. Always ensure your Access Key remains confidential.
              </p>
              <i className="fas fa-fingerprint absolute -right-4 -bottom-4 text-white/10 text-8xl"></i>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

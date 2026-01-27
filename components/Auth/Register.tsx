
import React, { useState } from 'react';
import { api } from '../../services/api';

interface RegisterProps {
  setCurrentScreen: React.Dispatch<React.SetStateAction<any>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const Register: React.FC<RegisterProps> = ({ setCurrentScreen, showToast }) => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    password: '',
    email: '',
    city: '',
    balance: 1000
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'balance' ? parseFloat(value) : value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, mobile, password, email, city, balance } = formData;
    if (!name || !mobile || !password || !email || !city || isNaN(balance)) {
      return showToast('Please fill all fields', 'error');
    }
    if (balance < 100) return showToast('Minimum initial deposit is ₹100', 'error');

    setLoading(true);
    try {
      const data = await api.register(formData);
      if (data.status === 'success') {
        showToast('Registration successful! Please login.', 'success');
        setCurrentScreen('login');
      } else {
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden p-8 animate-fade-in my-8 border border-white/10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">Create Account</h2>
        <p className="text-slate-400 text-sm mt-1">Join NexusBank and manage your wealth smarter</p>
      </div>

      <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
          <input
            name="name"
            type="text"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white placeholder-slate-500 transition-all"
            placeholder="John Doe"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Mobile Number</label>
          <input
            name="mobile"
            type="text"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white placeholder-slate-500 transition-all"
            placeholder="10 digit number"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input
            name="email"
            type="email"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white placeholder-slate-500 transition-all"
            placeholder="john@example.com"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <input
            name="password"
            type="password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white placeholder-slate-500 transition-all"
            placeholder="Set secure password"
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">City</label>
          <input
            name="city"
            type="text"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary outline-none text-white placeholder-slate-500 transition-all"
            placeholder="Current city"
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Initial Deposit (₹)</label>
          <input
            name="balance"
            type="number"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-secondary outline-none text-white placeholder-slate-500 font-bold"
            defaultValue="1000"
            onChange={handleChange}
          />
        </div>
        <div className="md:col-span-2 mt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-secondary/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin"></i> Processing...
              </span>
            ) : 'Register Securely'}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-white/5">
        <p className="text-slate-400 text-sm">
          Already a member?{' '}
          <button onClick={() => setCurrentScreen('login')} className="text-primary font-bold hover:underline ml-1">
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;

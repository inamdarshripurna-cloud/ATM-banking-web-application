
import React, { useState } from 'react';
import { api } from '../../services/api';
import { AuthState } from '../../types';

interface DepositProps {
  authState: AuthState;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onRefresh: () => void;
}

const Deposit: React.FC<DepositProps> = ({ authState, showToast, onRefresh }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user || !authState.sessionId) return;
    if (!amount || parseFloat(amount) <= 0) return showToast('Enter valid amount', 'error');

    setLoading(true);
    try {
      const data = await api.deposit(authState.user.mobile, authState.sessionId, parseFloat(amount));
      if (data.status === 'success') {
        showToast(data.message || 'Deposit successful!', 'success');
        onRefresh();
      } else {
        showToast(data.message || 'Deposit failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-card-dark rounded-3xl shadow-xl border border-gray-light dark:border-gray-800 overflow-hidden">
            <div className="bg-primary px-8 py-10 text-white">
              <h2 className="text-2xl font-black uppercase tracking-tight">Account Funding</h2>
              <p className="text-white/70 text-sm mt-1">Add immediate liquidity to your Nexus wallet</p>
            </div>
            
            <div className="p-8 md:p-10">
              <form onSubmit={handleDeposit} className="space-y-10">
                <div className="space-y-6 text-center">
                   <label className="block text-[10px] font-black text-gray uppercase tracking-[0.2em]">Quick Selection Denominations</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[500, 1000, 2000, 5000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(String(val))}
                        className={`py-4 rounded-xl border-2 transition-all font-black text-sm ${amount === String(val) ? 'bg-primary border-primary text-white shadow-lg' : 'border-gray-100 dark:border-gray-700 text-dark dark:text-gray-300 hover:border-primary'}`}
                      >
                        ₹{val}
                      </button>
                    ))}
                   </div>
                </div>

                <div className="relative group max-w-sm mx-auto">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-primary/30">₹</span>
                  <input
                    type="number"
                    className="w-full pl-12 pr-6 py-8 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary rounded-2xl outline-none text-center text-4xl font-black text-dark dark:text-white transition-all shadow-inner"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-xl uppercase tracking-tighter"
                >
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Confirm Deposit'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-card-dark p-8 rounded-3xl border border-gray-light dark:border-gray-800 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary">
                  <i className="fas fa-wallet"></i>
                </div>
                <span className="text-xs font-black uppercase text-gray tracking-widest">Available Balance</span>
              </div>
              <div className="text-4xl font-black text-dark dark:text-white tracking-tighter">
                ₹{authState.user?.balance.toFixed(2)}
              </div>
              <div className="pt-4 border-t border-gray-light dark:border-gray-800">
                <div className="text-[10px] font-bold text-gray uppercase tracking-widest mb-1">Account Holder</div>
                <div className="text-sm font-black text-dark dark:text-white uppercase">{authState.user?.name}</div>
              </div>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-3xl border border-primary/20">
            <h4 className="font-black text-primary uppercase tracking-widest text-xs mb-4">Instant Settlement</h4>
            <p className="text-[11px] font-bold text-gray dark:text-gray-400 leading-relaxed">
              Nexus settlements are instant. Your balance will reflect the new assets immediately upon confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;

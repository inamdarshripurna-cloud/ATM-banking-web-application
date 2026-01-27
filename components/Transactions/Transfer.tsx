
import React, { useState } from 'react';
import { api } from '../../services/api';
import { AuthState } from '../../types';

interface TransferProps {
  authState: AuthState;
  showToast: (msg: string, type: 'success' | 'error') => void;
  onRefresh: () => void;
}

const Transfer: React.FC<TransferProps> = ({ authState, showToast, onRefresh }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authState.user || !authState.sessionId) return;
    if (!recipient || !amount) return showToast('Please fill all required fields', 'error');
    if (recipient === authState.user.mobile) return showToast('Cannot transfer to yourself', 'error');

    setLoading(true);
    try {
      const data = await api.transfer(authState.user.mobile, authState.sessionId, recipient, parseFloat(amount));
      if (data.status === 'success') {
        showToast(data.message || 'Transfer successful!', 'success');
        onRefresh();
      } else {
        showToast(data.message || 'Transfer failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-card-dark rounded-3xl shadow-xl border border-gray-light dark:border-gray-800 overflow-hidden">
            <div className="bg-primary px-8 py-10 text-white">
              <h2 className="text-2xl font-black uppercase tracking-tight">Direct Money Transfer</h2>
              <p className="text-white/70 text-sm mt-1">Settle payments instantly to any Nexus account</p>
            </div>
            
            <div className="p-8 md:p-10">
              <form onSubmit={handleTransfer} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-gray uppercase tracking-widest border-b border-gray-light dark:border-gray-800 pb-2">Recipient Information</h3>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-gray/50 group-focus-within:text-primary transition-colors">
                      <i className="fas fa-id-card"></i>
                    </span>
                    <input
                      type="text"
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-light dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold transition-all"
                      placeholder="Recipient Mobile Number"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black text-gray uppercase tracking-widest border-b border-gray-light dark:border-gray-800 pb-2">Transaction Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-gray/50 group-focus-within:text-primary font-black">₹</span>
                      <input
                        type="number"
                        className="w-full pl-10 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-light dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary dark:text-white font-black text-2xl transition-all"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-3 bg-primary-light/50 dark:bg-primary/10 px-5 rounded-2xl border border-primary/20">
                      <i className="fas fa-wallet text-primary text-lg"></i>
                      <div className="text-[10px] leading-tight text-primary font-bold uppercase">
                        Wallet Balance<br/>
                        <span className="text-sm font-black tracking-tight">₹{authState.user?.balance.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <textarea
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-light dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary dark:text-white min-h-[120px] resize-none font-medium transition-all"
                    placeholder="Add a payment note (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-xl uppercase tracking-tighter"
                >
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane"></i> Authorize Transfer</>}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-gray-light dark:border-gray-800 shadow-sm flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase text-gray tracking-widest">Available Funds</span>
              <span className="text-2xl font-black text-dark dark:text-white">₹{authState.user?.balance.toFixed(2)}</span>
          </div>

          <div className="bg-yellow-50 dark:bg-warning/10 p-8 rounded-3xl border border-warning/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning flex items-center justify-center text-white">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4 className="font-black text-warning uppercase tracking-widest text-xs">Security Guide</h4>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3 text-xs font-bold text-gray dark:text-gray-400">
                <i className="fas fa-check text-warning mt-0.5"></i>
                Verify the recipient's identity before authorizing.
              </li>
              <li className="flex gap-3 text-xs font-bold text-gray dark:text-gray-400">
                <i className="fas fa-check text-warning mt-0.5"></i>
                Nexus transfers are final and non-reversible.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;

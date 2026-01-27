
import React, { useState, useEffect } from 'react';
import { AuthState, Transaction } from '../../types';
import { api } from '../../services/api';
import TransactionItem from '../UI/TransactionItem';

interface AdminTransactionsProps {
  authState: AuthState;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const AdminTransactions: React.FC<AdminTransactionsProps> = ({ authState, showToast }) => {
  const [allTx, setAllTx] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getAllTransactions();
      if (res.status === 'success') {
        setAllTx(res.transactions || []);
      }
    } catch (err) {
      showToast('Error loading transaction records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!search.trim()) return loadTransactions();
    
    setLoading(true);
    try {
      const res = await api.getTransactionsByMobile(search);
      if (res.status === 'success') {
        setAllTx(res.transactions || []);
      } else {
        showToast(res.message || 'No records found for this mobile', 'error');
        setAllTx([]);
      }
    } catch (err) {
      showToast('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-dark dark:text-white">Transaction Logs</h2>
          <p className="text-sm text-gray">Monitoring all movement of funds across the platform</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm min-w-[200px] dark:text-white"
            placeholder="Search by Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all text-sm font-bold"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => { setSearch(''); loadTransactions(); }}
            className="p-2 text-gray hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
            title="Clear Search"
          >
            <i className="fas fa-times"></i>
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : allTx.length > 0 ? (
          <div className="divide-y divide-gray-light dark:divide-gray-700">
            {allTx.map((tx, idx) => (
              <TransactionItem key={idx} transaction={tx} isAdminView />
            ))}
          </div>
        ) : (
          <div className="p-20 text-center text-gray">
            <i className="fas fa-file-invoice-dollar text-4xl mb-4 opacity-20"></i>
            <p>No transactions found in system logs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;

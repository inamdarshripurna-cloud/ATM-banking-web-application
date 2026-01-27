
import React, { useState, useEffect } from 'react';
import { AuthState, Transaction } from '../../types';
import { api } from '../../services/api';
import TransactionItem from '../UI/TransactionItem';

interface HistoryProps {
  authState: AuthState;
}

const History: React.FC<HistoryProps> = ({ authState }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw' | 'transfer'>('all');

  useEffect(() => {
    const loadTransactions = async () => {
      if (!authState.user || !authState.sessionId) return;
      try {
        const data = await api.getTransactions(authState.user.mobile, authState.sessionId);
        if (data.status === 'success') {
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, [authState]);

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'deposit') return t.type === 'deposit' || t.type === 'admin_deposit' || t.type === 'receive';
    if (filter === 'withdraw') return t.type === 'withdraw' || t.type === 'admin_withdraw';
    if (filter === 'transfer') return t.type === 'send' || t.type === 'receive';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-dark dark:text-white">Transaction History</h2>
        <div className="flex bg-white dark:bg-card-dark rounded-xl p-1 border border-gray-light dark:border-gray-700 shadow-sm">
          {(['all', 'deposit', 'withdraw', 'transfer'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-gray hover:text-primary dark:text-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-light dark:divide-gray-700">
            {filteredTransactions.map((t, idx) => (
              <TransactionItem key={idx} transaction={t} />
            ))}
          </div>
        ) : (
          <div className="p-20 text-center text-gray">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-2xl opacity-20"></i>
            </div>
            <p className="font-medium">No transactions found matching the filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

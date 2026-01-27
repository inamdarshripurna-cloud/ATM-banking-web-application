
import React, { useState, useEffect } from 'react';
import { AuthState, Transaction, ViewType } from '../../types';
import { api } from '../../services/api';
import TransactionItem from '../UI/TransactionItem';

interface DashboardProps {
  authState: AuthState;
  setView: (view: ViewType) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ authState, setView, showToast }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!authState.user || !authState.sessionId) return;
      try {
        const data = await api.getTransactions(authState.user.mobile, authState.sessionId);
        if (data.status === 'success') {
          setTransactions(data.transactions || []);
        }
      } catch (err) {
        showToast('Error loading dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [authState]);

  const stats = [
    { label: 'Account Balance', value: `₹${authState.user?.balance.toFixed(2)}`, icon: 'fa-wallet', color: 'text-primary' },
    { label: 'Recent Transactions', value: String(transactions.length), icon: 'fa-chart-line', color: 'text-secondary' },
    { label: 'Account Status', value: 'Active', icon: 'fa-check-circle', color: 'text-secondary' },
  ];

  const quickActions = [
    { id: 'transfer', label: 'Transfer', icon: 'fa-exchange-alt', color: 'bg-primary-light text-primary' },
    { id: 'deposit', label: 'Deposit', icon: 'fa-arrow-down', color: 'bg-green-100 text-secondary' },
    { id: 'withdraw', label: 'Withdraw', icon: 'fa-arrow-up', color: 'bg-red-100 text-danger' },
    { id: 'history', label: 'History', icon: 'fa-history', color: 'bg-yellow-100 text-warning' },
    { id: 'chat', label: 'Support', icon: 'fa-comments', color: 'bg-blue-100 text-info' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray text-sm font-medium">{stat.label}</span>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-700 ${stat.color}`}>
                <i className={`fas ${stat.icon} text-lg`}></i>
              </div>
            </div>
            <div className="text-3xl font-bold text-dark dark:text-white">{stat.value}</div>
            <div className="mt-2 text-xs text-secondary flex items-center gap-1">
              <i className="fas fa-arrow-up"></i>
              <span>Live tracking enabled</span>
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-bold mb-6 text-dark dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setView(action.id as ViewType)}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${action.color}`}>
                <i className={`fas ${action.icon} text-lg`}></i>
              </div>
              <span className="text-sm font-semibold text-dark dark:text-gray-300">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark dark:text-white">Recent Transactions</h2>
          <button 
            onClick={() => setView('history')}
            className="text-primary font-semibold hover:underline"
          >
            View All
          </button>
        </div>
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
          ) : transactions.length > 0 ? (
            <div className="divide-y divide-gray-light dark:divide-gray-700">
              {transactions.slice(0, 5).map((t, idx) => (
                <TransactionItem key={idx} transaction={t} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray">
              <i className="fas fa-exchange-alt text-4xl mb-4 opacity-20"></i>
              <p>No transactions found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

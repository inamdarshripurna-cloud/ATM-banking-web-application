
import React, { useState, useEffect } from 'react';
import { AuthState, Transaction, User } from '../../types';
import { api } from '../../services/api';
import TransactionItem from '../UI/TransactionItem';

interface AdminDashboardProps {
  authState: AuthState;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ authState, showToast }) => {
  const [stats, setStats] = useState({
    users: 0,
    totalBalance: 0,
    totalTx: 0,
    todayTx: 0
  });
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const usersRes = await api.getAllUsers();
        const txRes = await api.getAllTransactions();

        if (usersRes.status === 'success' && txRes.status === 'success') {
          const users = usersRes.users as User[];
          const transactions = txRes.transactions as Transaction[];

          const today = new Date().toISOString().split('T')[0];
          const todayCount = transactions.filter(t => new Date(t.Date).toISOString().split('T')[0] === today).length;

          setStats({
            users: users.length,
            totalBalance: users.reduce((acc, u) => acc + (Number(u.balance) || 0), 0),
            totalTx: transactions.length,
            todayTx: todayCount
          });

          setRecentTx(transactions.slice(0, 10));
        }
      } catch (err) {
        showToast('Failed to load admin metrics', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadAdminData();
  }, []);

  const metricCards = [
    { label: 'Total Users', value: stats.users, icon: 'fa-users', color: 'text-primary' },
    { label: 'Total Bank Balance', value: `₹${stats.totalBalance.toFixed(2)}`, icon: 'fa-vault', color: 'text-green-500' },
    { label: 'Total Transactions', value: stats.totalTx, icon: 'fa-exchange-alt', color: 'text-yellow-500' },
    { label: "Today's Activity", value: stats.todayTx, icon: 'fa-bolt', color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, i) => (
          <div key={i} className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-gray-light dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${metric.color}`}>
                <i className={`fas ${metric.icon} text-xl`}></i>
              </div>
              <div>
                <p className="text-sm text-gray font-medium">{metric.label}</p>
                <p className="text-2xl font-bold text-dark dark:text-white truncate">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-bold mb-6 text-dark dark:text-white">Global Recent Activity</h2>
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
          ) : recentTx.length > 0 ? (
            <div className="divide-y divide-gray-light dark:divide-gray-700">
              {recentTx.map((tx, idx) => (
                <TransactionItem key={idx} transaction={tx} isAdminView />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-gray">No activity logged yet</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

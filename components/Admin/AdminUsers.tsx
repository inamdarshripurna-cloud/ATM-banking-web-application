
import React, { useState, useEffect } from 'react';
import { AuthState, User } from '../../types';
import { api } from '../../services/api';

interface AdminUsersProps {
  authState: AuthState;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

type ModalType = 'balance' | 'edit' | 'delete' | null;

interface ModalState {
  type: ModalType;
  user: User | null;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ authState, showToast }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ type: null, user: null });
  
  // Balance Modal Form State
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOp, setBalanceOp] = useState<'deposit' | 'withdraw'>('deposit');
  
  // Edit Modal Form State
  const [editForm, setEditForm] = useState({ name: '', email: '', city: '' });
  
  const [processing, setProcessing] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAllUsers();
      if (res.status === 'success') {
        setUsers(res.users || []);
      } else {
        showToast(res.message || 'Failed to fetch users', 'error');
      }
    } catch (err) {
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openModal = (type: ModalType, user: User) => {
    setModal({ type, user });
    if (type === 'edit') {
      setEditForm({
        name: user.name,
        email: user.email || '',
        city: user.city || ''
      });
    } else if (type === 'balance') {
      setBalanceAmount('');
      setBalanceOp('deposit');
    }
  };

  const closeModal = () => {
    setModal({ type: null, user: null });
    setProcessing(false);
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.user || !balanceAmount || processing) return;
    
    setProcessing(true);
    try {
      const amount = parseFloat(balanceAmount);
      const res = await api.adjustBalance(modal.user.mobile, amount, balanceOp);
      if (res.status === 'success') {
        showToast(`Successfully ${balanceOp}ed ₹${amount}`, 'success');
        await loadUsers();
        closeModal();
      } else {
        showToast(res.message || 'Balance adjustment failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.user || processing || !authState.sessionId) return;

    setProcessing(true);
    try {
      // Using updateProfile API which admins can also use to update users
      const res = await api.updateProfile(modal.user.mobile, authState.sessionId, editForm);
      if (res.status === 'success') {
        showToast('User updated successfully', 'success');
        await loadUsers();
        closeModal();
      } else {
        showToast(res.message || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!modal.user || processing) return;

    setProcessing(true);
    try {
      const res = await api.deleteUser(modal.user.mobile);
      if (res.status === 'success') {
        showToast('User deleted successfully', 'success');
        await loadUsers();
        closeModal();
      } else {
        showToast(res.message || 'Deletion failed', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-card-dark p-6 rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-dark dark:text-white">User Management</h2>
          <p className="text-sm text-gray">Monitor and manage all registered bank customers</p>
        </div>
        <button 
          onClick={loadUsers}
          className="p-2 text-primary hover:bg-primary-light dark:hover:bg-primary/10 rounded-xl transition-all"
          title="Refresh List"
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
        </button>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-light dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold text-gray uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-gray uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-gray uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-light dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.mobile} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-dark dark:text-gray-200">{user.name}</div>
                          <div className="text-xs text-gray">ID: {user.mobile.slice(-4)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-dark dark:text-gray-300">{user.mobile}</div>
                      <div className="text-xs text-gray">{user.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-dark dark:text-gray-300">{user.city || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-secondary">₹{user.balance.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openModal('balance', user)}
                          className="w-8 h-8 rounded-lg bg-green-100 text-secondary hover:bg-green-200 flex items-center justify-center transition-all"
                          title="Adjust Balance"
                        >
                          <i className="fas fa-wallet text-xs"></i>
                        </button>
                        <button 
                          onClick={() => openModal('edit', user)}
                          className="w-8 h-8 rounded-lg bg-blue-100 text-info hover:bg-blue-200 flex items-center justify-center transition-all"
                          title="Edit User"
                        >
                          <i className="fas fa-edit text-xs"></i>
                        </button>
                        <button 
                          onClick={() => openModal('delete', user)}
                          className="w-8 h-8 rounded-lg bg-red-100 text-danger hover:bg-red-200 flex items-center justify-center transition-all"
                          title="Delete User"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-light dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-dark dark:text-white">
                {modal.type === 'balance' && 'Adjust User Balance'}
                {modal.type === 'edit' && 'Edit User Details'}
                {modal.type === 'delete' && 'Confirm Deletion'}
              </h3>
              <button onClick={closeModal} className="text-gray hover:text-dark dark:hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {modal.type === 'balance' && (
                <form onSubmit={handleAdjustBalance} className="space-y-4">
                  <p className="text-sm text-gray mb-4">Managing balance for <span className="font-bold text-dark dark:text-white">{modal.user?.name}</span></p>
                  
                  <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setBalanceOp('deposit')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${balanceOp === 'deposit' ? 'bg-secondary text-white shadow-sm' : 'text-gray'}`}
                    >
                      Deposit
                    </button>
                    <button
                      type="button"
                      onClick={() => setBalanceOp('withdraw')}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${balanceOp === 'withdraw' ? 'bg-danger text-white shadow-sm' : 'text-gray'}`}
                    >
                      Withdraw
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray uppercase mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      autoFocus
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white font-bold text-lg"
                      placeholder="0.00"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 border border-gray-light dark:border-gray-700 text-gray font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
                    <button 
                      type="submit" 
                      disabled={processing || !balanceAmount}
                      className={`flex-1 px-4 py-3 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 ${balanceOp === 'deposit' ? 'bg-secondary' : 'bg-danger'}`}
                    >
                      {processing ? <i className="fas fa-spinner fa-spin"></i> : `Confirm ${balanceOp.charAt(0).toUpperCase() + balanceOp.slice(1)}`}
                    </button>
                  </div>
                </form>
              )}

              {modal.type === 'edit' && (
                <form onSubmit={handleEditUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray uppercase mb-1">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                      value={editForm.city}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    />
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 border border-gray-light dark:border-gray-700 text-gray font-bold rounded-xl">Cancel</button>
                    <button type="submit" disabled={processing} className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl shadow-lg">
                      {processing ? <i className="fas fa-spinner fa-spin"></i> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {modal.type === 'delete' && (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-red-100 text-danger rounded-full flex items-center justify-center mx-auto text-2xl">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-dark dark:text-white">Delete User?</h4>
                    <p className="text-sm text-gray mt-2">
                      Are you sure you want to delete <span className="font-bold text-dark dark:text-white">{modal.user?.name}</span>? This action is permanent and cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={closeModal} className="flex-1 px-4 py-3 border border-gray-light dark:border-gray-700 text-gray font-bold rounded-xl">Cancel</button>
                    <button onClick={handleDeleteUser} disabled={processing} className="flex-1 px-4 py-3 bg-danger text-white font-bold rounded-xl shadow-lg">
                      {processing ? <i className="fas fa-spinner fa-spin"></i> : 'Delete Permanently'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

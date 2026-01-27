
import React, { useState } from 'react';
import { AuthState } from '../../types';

interface AdminSettingsProps {
  authState: AuthState;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ authState, showToast }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'NexusBank ATM',
    taxRate: '2.0',
    maxWithdrawal: '50000',
    supportEmail: 'support@nexusbank.com',
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('System settings updated successfully', 'success');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      return showToast('Passwords do not match', 'error');
    }
    showToast('Admin password updated', 'success');
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-light dark:border-gray-700">
          <h2 className="text-xl font-bold text-dark dark:text-white">System Configuration</h2>
          <p className="text-sm text-gray">Global platform parameters and preferences</p>
        </div>
        <div className="p-8">
          <form onSubmit={saveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Platform Name</label>
                <input
                  type="text"
                  name="platformName"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  value={settings.platformName}
                  onChange={handleSettingsChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  step="0.1"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  value={settings.taxRate}
                  onChange={handleSettingsChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Daily Withdrawal (₹)</label>
                <input
                  type="number"
                  name="maxWithdrawal"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  value={settings.maxWithdrawal}
                  onChange={handleSettingsChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Support Contact Email</label>
                <input
                  type="email"
                  name="supportEmail"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                  value={settings.supportEmail}
                  onChange={handleSettingsChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div>
                <h4 className="font-bold text-dark dark:text-white">Maintenance Mode</h4>
                <p className="text-xs text-gray">Prevent new user logins and transactions</p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${maintenanceMode ? 'bg-danger' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${maintenanceMode ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-8 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-all"
              >
                Save System Config
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-light dark:border-gray-700">
          <h2 className="text-xl font-bold text-dark dark:text-white">Security & Access</h2>
          <p className="text-sm text-gray">Manage admin account credentials</p>
        </div>
        <div className="p-8">
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-danger dark:text-white"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-danger dark:text-white"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-light dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-danger dark:text-white"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="px-8 py-2.5 bg-danger text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all"
              >
                Change Admin Password
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-white dark:bg-card-dark p-8 rounded-2xl shadow-sm border border-gray-light dark:border-gray-700 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-warning flex items-center justify-center">
              <i className="fas fa-database"></i>
            </div>
            <div>
              <h4 className="font-bold text-dark dark:text-white">Database Backups</h4>
              <p className="text-xs text-gray">Last automated backup: 2 hours ago</p>
            </div>
         </div>
         <button className="text-primary font-bold text-sm hover:underline">
           Trigger Manual Backup
         </button>
      </div>
    </div>
  );
};

export default AdminSettings;

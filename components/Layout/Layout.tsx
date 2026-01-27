
import React, { useState } from 'react';
import { AuthState } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  authState: AuthState;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  isAdmin: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  authState, 
  currentView, 
  onNavigate, 
  onLogout, 
  onToggleTheme, 
  darkMode,
  isAdmin 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
    { id: 'transfer', label: 'Transfer Money', icon: 'fa-exchange-alt' },
    { id: 'deposit', label: 'Deposit', icon: 'fa-arrow-down' },
    { id: 'withdraw', label: 'Withdraw', icon: 'fa-arrow-up' },
    { id: 'history', label: 'History', icon: 'fa-history' },
    { id: 'profile', label: 'Profile', icon: 'fa-user' },
    { id: 'chat', label: 'Chat Support', icon: 'fa-comments' },
  ];

  const adminMenuItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
    { id: 'admin-users', label: 'Manage Users', icon: 'fa-users' },
    { id: 'admin-transactions', label: 'All Transactions', icon: 'fa-exchange-alt' },
    { id: 'admin-chat', label: 'Chat Support', icon: 'fa-comments' },
    { id: 'admin-settings', label: 'Settings', icon: 'fa-cog' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="flex h-screen bg-body-light dark:bg-body-dark overflow-hidden font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Sidebar overlay for mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 transform bg-white dark:bg-card-dark shadow-2xl 
        transition-transform duration-300 ease-in-out border-r border-gray-light dark:border-gray-800
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-8 border-b border-gray-light dark:border-gray-800 flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <i className={`fas ${isAdmin ? 'fa-user-shield' : 'fa-university'} text-xl`}></i>
            </div>
            <h2 className="text-xl font-black text-primary tracking-tighter uppercase">
              {isAdmin ? 'Nexus Admin' : 'Nexus Bank'}
            </h2>
          </div>

          <nav className="flex-1 px-4 py-8 overflow-y-auto no-scrollbar space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group
                  ${currentView === item.id 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                    : 'text-gray dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary'}
                `}
              >
                <i className={`fas ${item.icon} w-6 text-center text-lg ${currentView === item.id ? 'text-white' : 'group-hover:text-primary transition-colors'}`}></i>
                <span className="font-bold tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-light dark:border-gray-800 shrink-0">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-bold"
            >
              <i className="fas fa-sign-out-alt w-6 text-center text-lg"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="bg-white/80 dark:bg-card-dark/80 backdrop-blur-md border-b border-gray-light dark:border-gray-800 z-30 h-20 shrink-0">
          <div className="flex items-center justify-between px-6 md:px-10 h-full">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden text-2xl text-dark dark:text-white p-2"
                onClick={() => setMobileMenuOpen(true)}
              >
                <i className="fas fa-bars-staggered"></i>
              </button>
              <h1 className="text-xl md:text-2xl font-black text-dark dark:text-white tracking-tighter uppercase truncate max-w-[150px] md:max-w-none">
                {menuItems.find(i => i.id === currentView)?.label || 'System'}
              </h1>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={onToggleTheme}
                className="w-10 h-10 rounded-full text-gray dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center text-lg shadow-sm"
              >
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
              </button>

              <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-black text-dark dark:text-white leading-none mb-1 uppercase tracking-tighter">
                    {isAdmin ? 'System Master' : authState.user?.name}
                  </div>
                  <div className="text-[10px] text-gray font-bold uppercase tracking-widest opacity-60">
                    {isAdmin ? 'Admin' : 'Platinum Member'}
                  </div>
                </div>
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20 ring-2 ring-white dark:ring-gray-800">
                  {isAdmin ? 'A' : authState.user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-body-dark relative no-scrollbar">
          <div className="w-full min-h-full p-6 md:p-8 lg:p-12 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

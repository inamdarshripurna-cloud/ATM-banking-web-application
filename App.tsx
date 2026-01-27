
import React, { useState, useEffect, useCallback } from 'react';
import { AuthState, User, ViewType, AdminViewType } from './types';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminLogin from './components/Auth/AdminLogin';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Transfer from './components/Transactions/Transfer';
import Deposit from './components/Transactions/Deposit';
import Withdraw from './components/Transactions/Withdraw';
import History from './components/Transactions/History';
import Profile from './components/Profile/Profile';
import Chat from './components/Chat/Chat';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminUsers from './components/Admin/AdminUsers';
import AdminTransactions from './components/Admin/AdminTransactions';
import AdminChat from './components/Admin/AdminChat';
import AdminSettings from './components/Admin/AdminSettings';
import Toast from './components/UI/Toast';
import { api } from './services/api';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    sessionId: null,
    isAdmin: false,
  });
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register' | 'admin-login' | 'app' | 'admin-app'>('login');
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentAdminView, setCurrentAdminView] = useState<AdminViewType>('admin-dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedSessionId = localStorage.getItem('sessionId');
    const savedAdminSessionId = localStorage.getItem('adminSessionId');
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';

    if (savedDarkMode) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    if (savedAdminSessionId) {
      setAuthState(prev => ({ ...prev, isAdmin: true, sessionId: savedAdminSessionId }));
      setCurrentScreen('admin-app');
    } else if (savedUser && savedSessionId) {
      setAuthState({
        user: JSON.parse(savedUser),
        sessionId: savedSessionId,
        isAdmin: false,
      });
      setCurrentScreen('app');
    }
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshUserData = useCallback(async () => {
    if (authState.user && authState.sessionId) {
      try {
        const userData = await api.getUser(authState.user.mobile);
        if (userData.status === 'success') {
          setAuthState(prev => ({ ...prev, user: userData.user }));
          localStorage.setItem('currentUser', JSON.stringify(userData.user));
        }
      } catch (err) {
        console.error("Failed to refresh user data", err);
      }
    }
  }, [authState.user, authState.sessionId]);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('darkMode', String(nextMode));
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('adminSessionId');
    setAuthState({ user: null, sessionId: null, isAdmin: false });
    setCurrentScreen('login');
    showToast('Logged out successfully', 'success');
  };

  const handleTransactionSuccess = async () => {
    await refreshUserData();
    setCurrentView('dashboard');
  };

  const renderUserContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard authState={authState} setView={setCurrentView} showToast={showToast} />;
      case 'transfer': return <Transfer authState={authState} showToast={showToast} onRefresh={handleTransactionSuccess} />;
      case 'deposit': return <Deposit authState={authState} showToast={showToast} onRefresh={handleTransactionSuccess} />;
      case 'withdraw': return <Withdraw authState={authState} showToast={showToast} onRefresh={handleTransactionSuccess} />;
      case 'history': return <History authState={authState} />;
      case 'profile': return <Profile authState={authState} setAuthState={setAuthState} showToast={showToast} />;
      case 'chat': return <Chat authState={authState} showToast={showToast} />;
      default: return <Dashboard authState={authState} setView={setCurrentView} showToast={showToast} />;
    }
  };

  const renderAdminContent = () => {
    switch (currentAdminView) {
      case 'admin-dashboard': return <AdminDashboard authState={authState} showToast={showToast} />;
      case 'admin-users': return <AdminUsers authState={authState} showToast={showToast} />;
      case 'admin-transactions': return <AdminTransactions authState={authState} showToast={showToast} />;
      case 'admin-chat': return <AdminChat authState={authState} showToast={showToast} />;
      case 'admin-settings': return <AdminSettings authState={authState} showToast={showToast} />;
      default: return <AdminDashboard authState={authState} showToast={showToast} />;
    }
  };

  if (currentScreen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-red-800 to-yellow-500 flex items-center justify-center p-4">
        <Login setAuthState={setAuthState} setCurrentScreen={setCurrentScreen} showToast={showToast} />
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    );
  }

  if (currentScreen === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-red-800 to-yellow-500 flex items-center justify-center p-4">
        <Register setCurrentScreen={setCurrentScreen} showToast={showToast} />
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    );
  }

  if (currentScreen === 'admin-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-red-800 to-yellow-500 flex items-center justify-center p-4">
        <AdminLogin setAuthState={setAuthState} setCurrentScreen={setCurrentScreen} showToast={showToast} />
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Layout 
        authState={authState}
        currentView={currentScreen === 'app' ? currentView : currentAdminView}
        onNavigate={(view: string) => {
          if (currentScreen === 'app') setCurrentView(view as ViewType);
          else setCurrentAdminView(view as AdminViewType);
        }}
        onLogout={handleLogout}
        onToggleTheme={toggleDarkMode}
        darkMode={darkMode}
        isAdmin={currentScreen === 'admin-app'}
      >
        {currentScreen === 'app' ? renderUserContent() : renderAdminContent()}
      </Layout>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default App;

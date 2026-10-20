import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ApiDebugPanel } from './components/ApiDebugPanel';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { LibrariansPage } from './pages/LibrariansPage';
import { BooksPage } from './pages/BooksPage';
import { PolicyPage } from './pages/PolicyPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { RbacTestPage } from './pages/RbacTestPage';
import { VerificationPage } from './pages/VerificationPage';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#57606a' }}>
        Verifying administrative session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <LoginPage />
        <ApiDebugPanel />
      </div>
    );
  }

  return (
    <div>
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="container">
        {currentTab === 'dashboard' && <DashboardPage onNavigate={setCurrentTab} />}
        {currentTab === 'users' && <UsersPage />}
        {currentTab === 'librarians' && <LibrariansPage />}
        {currentTab === 'books' && <BooksPage />}
        {currentTab === 'policy' && <PolicyPage />}
        {currentTab === 'reports' && <ReportsPage />}
        {currentTab === 'audit' && <AuditLogsPage />}
        {currentTab === 'notifications' && <NotificationsPage />}
        {currentTab === 'profile' && <ProfilePage />}
        {currentTab === 'rbac' && <RbacTestPage />}
        {currentTab === 'verification' && <VerificationPage />}
      </main>

      <ApiDebugPanel />
    </div>
  );
};

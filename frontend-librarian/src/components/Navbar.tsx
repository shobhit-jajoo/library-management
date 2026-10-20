import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const [apiHealth, setApiHealth] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');

  const checkStatus = async () => {
    try {
      const h = await authApi.checkHealth();
      setApiHealth(h.status === 'ok' ? 'UP' : 'DOWN');
    } catch {
      setApiHealth('DOWN');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { key: 'circulation', label: '⚡ Issue & Return Desk' },
    { key: 'books', label: '📚 Books & Inventory' },
    { key: 'users', label: '👥 Patron Management' },
    { key: 'loans', label: '⏳ Overdue & Active Loans' },
    { key: 'fines', label: '💰 Fine Settlements' },
    { key: 'reservations', label: '📌 Reservations Queue' },
    { key: 'reports', label: '📊 Desk Analytics & Reports' },
  ];

  return (
    <header className="navbar">
      <div className="navbar-top">
        <div className="navbar-brand">
          <div className="navbar-icon">📖</div>
          <div>
            <div className="navbar-title">Librarian Operations Portal</div>
            <div className="navbar-subtitle">Library Management System Desk Hub</div>
          </div>
          <span className={`status-pill ${apiHealth === 'UP' ? 'online' : 'offline'}`}>
            API: {apiHealth}
          </span>
        </div>

        {user && (
          <div className="navbar-user">
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role badge-librarian">{user.role}</span>
              <span className="user-reg">[{user.registrationNumber}]</span>
            </div>
            <button onClick={() => logout()} className="btn btn-outline-danger btn-sm">
              Sign Out
            </button>
          </div>
        )}
      </div>

      {user && (
        <nav className="navbar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`nav-tab ${currentTab === item.key ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};

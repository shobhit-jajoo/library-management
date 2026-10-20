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
  const [dbHealth, setDbHealth] = useState<'UP' | 'DOWN' | 'CHECKING'>('CHECKING');

  const checkStatus = async () => {
    try {
      const h = await authApi.checkHealth();
      setApiHealth(h.status === 'ok' ? 'UP' : 'DOWN');
    } catch {
      setApiHealth('DOWN');
    }

    try {
      const db = await authApi.checkDbHealth();
      setDbHealth(db.status === 'ok' ? 'UP' : 'DOWN');
    } catch {
      setDbHealth('DOWN');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'users', label: 'Patrons & Users' },
    { key: 'librarians', label: 'Add Librarian' },
    { key: 'books', label: 'Books & Copies' },
    { key: 'policy', label: 'System Policy' },
    { key: 'reports', label: 'Reports' },
    { key: 'audit', label: 'Audit Logs' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'rbac', label: 'RBAC Sandbox' },
    { key: 'verification', label: 'Checklist (49)' },
    { key: 'profile', label: 'Profile / Pass' },
  ];

  return (
    <header style={{ backgroundColor: '#24292f', color: '#ffffff', padding: '8px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <strong style={{ fontSize: '1.05rem', letterSpacing: 0.5 }}>
            📚 LMS Admin Portal
          </strong>
          <span
            style={{
              fontSize: '0.72rem',
              backgroundColor: '#388bfd33',
              color: '#58a6ff',
              padding: '2px 6px',
              borderRadius: 3,
              border: '1px solid #388bfd',
            }}
          >
            TEST HARNESS
          </span>
          <div style={{ display: 'flex', gap: 6, fontSize: '0.75rem', marginLeft: 8 }}>
            <span
              style={{
                color: apiHealth === 'UP' ? '#3fb950' : apiHealth === 'DOWN' ? '#f85149' : '#d29922',
              }}
              title="Backend /health status"
            >
              API: {apiHealth}
            </span>
            <span>|</span>
            <span
              style={{
                color: dbHealth === 'UP' ? '#3fb950' : dbHealth === 'DOWN' ? '#f85149' : '#d29922',
              }}
              title="Database /health/db status"
            >
              DB: {dbHealth}
            </span>
          </div>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem' }}>
            <span>
              Logged in: <strong>{user.name}</strong> ({user.role}) [{user.registrationNumber}]
            </span>
            <button
              onClick={() => logout()}
              className="btn btn-danger btn-sm"
              style={{ padding: '2px 8px' }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {user && (
        <nav
          style={{
            display: 'flex',
            gap: 4,
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid #3d444d',
            overflowX: 'auto',
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              style={{
                background: currentTab === item.key ? '#0969da' : 'transparent',
                color: currentTab === item.key ? '#ffffff' : '#adbac7',
                border: 'none',
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: currentTab === item.key ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
};

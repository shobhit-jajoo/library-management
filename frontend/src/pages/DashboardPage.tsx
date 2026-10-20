import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { ErrorDisplay } from '../components/ErrorDisplay';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [dbHealthStatus, setDbHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const h = await authApi.checkHealth();
      setHealthStatus(h);
      const db = await authApi.checkDbHealth();
      setDbHealthStatus(db);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Administrator Control Center</h2>
          <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.9rem' }}>
            System overview and quick navigation for manual backend verification
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchHealth} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Health'}
        </button>
      </div>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      {/* Grid of status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#57606a' }}>Current Administrator</h4>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: '0.85rem', color: '#57606a', marginTop: 4 }}>
            <div>Email: <strong>{user?.email}</strong></div>
            <div>Reg No: <strong>{user?.registrationNumber}</strong></div>
            <div>Role: <span className="badge badge-admin">{user?.role}</span></div>
            <div>Status: <span className="badge badge-success">{user?.status}</span></div>
          </div>
        </div>

        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#57606a' }}>Backend Health (/health)</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: healthStatus?.status === 'ok' ? '#2da44e' : '#cf222e',
              }}
            />
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {healthStatus?.status?.toUpperCase() || 'UNAVAILABLE'}
            </span>
          </div>
          <pre style={{ fontSize: '0.75rem', background: '#f6f8fa', padding: 6, marginTop: 8, borderRadius: 3 }}>
            {JSON.stringify(healthStatus, null, 2)}
          </pre>
        </div>

        <div className="card">
          <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#57606a' }}>Database Health (/health/db)</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: dbHealthStatus?.status === 'ok' ? '#2da44e' : '#cf222e',
              }}
            />
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {dbHealthStatus?.status?.toUpperCase() || 'UNAVAILABLE'}
            </span>
          </div>
          <pre style={{ fontSize: '0.75rem', background: '#f6f8fa', padding: 6, marginTop: 8, borderRadius: 3 }}>
            {JSON.stringify(dbHealthStatus, null, 2)}
          </pre>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Verification Modules</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('users')}>
          <h4 style={{ margin: '0 0 6px 0', color: '#0969da' }}>👥 User Management</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#57606a' }}>
            List, search, filter, update roles, activate, and deactivate users.
          </p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('librarians')}>
          <h4 style={{ margin: '0 0 6px 0', color: '#0969da' }}>🛡️ Create Librarian</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#57606a' }}>
            Dedicated Admin endpoint to provision new staff librarian accounts.
          </p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('policy')}>
          <h4 style={{ margin: '0 0 6px 0', color: '#0969da' }}>⚙️ System Policy</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#57606a' }}>
            View and dynamically update borrow limit, loan duration, fines, and renewals.
          </p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('reports')}>
          <h4 style={{ margin: '0 0 6px 0', color: '#0969da' }}>📊 System Reports</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#57606a' }}>
            Circulation, overdue loans, accrued fines, and borrowing statistics.
          </p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('books')}>
          <h4 style={{ margin: '0 0 6px 0', color: '#0969da' }}>📖 Books & Inventory</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#57606a' }}>
            Catalogue search, book creation/editing, copy management, and barcode lookup.
          </p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('audit')}>
          <h4 style={{ margin: '0 0 6px 0', color: '#0969da' }}>📜 Audit Logs</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#57606a' }}>
            Review full immutable system audit events, filters, and metadata.
          </p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('rbac')}>
          <h4 style={{ margin: '0 0 6px 0', color: '#cf222e' }}>🔒 RBAC Sandbox</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#57606a' }}>
            Fire custom requests with patron/librarian/admin tokens to test 403 Forbidden.
          </p>
        </div>

        <div className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('verification')}>
          <h4 style={{ margin: '0 0 6px 0', color: '#1a7f37' }}>✅ Verification Checklist</h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#57606a' }}>
            Track progress across all 49 administrative verification test criteria.
          </p>
        </div>
      </div>
    </div>
  );
};

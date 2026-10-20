import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ErrorDisplay } from '../components/ErrorDisplay';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('admin@library.local');
  const [password, setPassword] = useState('RAMGAHLOT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fillAdminEmail = () => {
    setIdentifier('admin@library.local');
    setPassword('RAMGAHLOT');
  };

  const fillAdminRegNo = () => {
    setIdentifier('ADM-001');
    setPassword('RAMGAHLOT');
  };

  const fillInvalid = () => {
    setIdentifier('admin@library.local');
    setPassword('WrongPassword!');
  };

  return (
    <div
      style={{
        maxWidth: 440,
        margin: '60px auto',
        padding: 24,
        background: '#ffffff',
        border: '1px solid #d0d7de',
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: '1.4rem' }}>Admin Portal Login</h2>
      <p style={{ fontSize: '0.85rem', color: '#57606a', marginTop: 0, marginBottom: 16 }}>
        Library Management System Backend Verification Client
      </p>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
            Identifier (Email or Registration Number)
          </label>
          <input
            type="text"
            className="form-control"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            placeholder="e.g. admin@library.local or ADM-001"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
            Password
          </label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '8px 0' }}
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #eee' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#57606a', marginBottom: 8 }}>
          Quick Fill Test Credentials:
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fillAdminEmail}
            disabled={loading}
          >
            Admin (Email)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fillAdminRegNo}
            disabled={loading}
          >
            Admin (RegNo)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fillInvalid}
            disabled={loading}
          >
            Wrong Pass (Test 401)
          </button>
        </div>
      </div>
    </div>
  );
};

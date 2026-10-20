import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ErrorDisplay } from '../components/ErrorDisplay';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('librarian1@library.local');
  const [password, setPassword] = useState('LibrarianPassword123!');
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

  const fillLibrarian1 = () => {
    setIdentifier('librarian1@library.local');
    setPassword('LibrarianPassword123!');
  };

  const fillLibrarianRegNo = () => {
    setIdentifier('LIB-001');
    setPassword('LibrarianPassword123!');
  };

  const fillAdmin = () => {
    setIdentifier('admin@library.local');
    setPassword('RAMGAHLOT');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-badge">STAFF DESK</div>
          <h2>Librarian Desk Login</h2>
          <p>Sign in to manage library circulation, catalog, patron accounts, and fines</p>
        </div>

        <ErrorDisplay error={error} onClear={() => setError(null)} />

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Staff Identifier (Email or Registration Number)</label>
            <input
              type="text"
              className="form-control"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. librarian1@library.local or LIB-001"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Desk Portal'}
          </button>
        </form>

        <div className="login-quickfill">
          <span className="quickfill-title">Quick Development Logins:</span>
          <div className="quickfill-buttons">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={fillLibrarian1}>
              Librarian 1 (Email)
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={fillLibrarianRegNo}>
              Librarian (LIB-001)
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={fillAdmin}>
              Admin Staff (Email)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

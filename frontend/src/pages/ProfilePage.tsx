import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth.api';
import { ErrorDisplay } from '../components/ErrorDisplay';

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setError(new Error('New password and confirm password do not match.'));
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.changePassword(oldPassword, newPassword);
      if (res.success) {
        setSuccessMsg('Password changed successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Administrator Profile & Security</h2>
        <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.88rem' }}>
          Inspect active session identity and test credential update flows.
        </p>
      </div>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      {successMsg && (
        <div
          style={{
            backgroundColor: '#dafbe1',
            border: '1px solid #4ac26b',
            color: '#1a7f37',
            padding: '10px 14px',
            borderRadius: 4,
            marginBottom: 16,
            fontSize: '0.88rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>✅ {successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            style={{ background: 'none', border: 'none', color: '#1a7f37', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Profile Details Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ margin: 0 }}>Current Identity (GET /api/v1/auth/me)</h4>
          <button className="btn btn-secondary btn-sm" onClick={refreshProfile}>
            🔄 Refresh Identity
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.88rem' }}>
          <div>
            <div style={{ color: '#57606a', fontSize: '0.8rem' }}>User ID</div>
            <code>{user?.id}</code>
          </div>
          <div>
            <div style={{ color: '#57606a', fontSize: '0.8rem' }}>Registration Number</div>
            <strong>{user?.registrationNumber}</strong>
          </div>
          <div>
            <div style={{ color: '#57606a', fontSize: '0.8rem' }}>Full Name</div>
            <div>{user?.name}</div>
          </div>
          <div>
            <div style={{ color: '#57606a', fontSize: '0.8rem' }}>Email</div>
            <div>{user?.email}</div>
          </div>
          <div>
            <div style={{ color: '#57606a', fontSize: '0.8rem' }}>Role</div>
            <div><span className="badge badge-admin">{user?.role}</span></div>
          </div>
          <div>
            <div style={{ color: '#57606a', fontSize: '0.8rem' }}>Account Status</div>
            <div><span className="badge badge-success">{user?.status}</span></div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card">
        <h4 style={{ margin: '0 0 12px 0' }}>Change Password (POST /api/v1/auth/change-password)</h4>
        <form onSubmit={handlePasswordChange}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Current Password *
            </label>
            <input
              type="password"
              className="form-control"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              New Password *
            </label>
            <input
              type="password"
              className="form-control"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters, letters & numbers"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Confirm New Password *
            </label>
            <input
              type="password"
              className="form-control"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Changing Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

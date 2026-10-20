import React, { useState, useEffect } from 'react';
import { policyApi } from '../api/policy.api';
import { SystemPolicy } from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';

export const PolicyPage: React.FC = () => {
  const [policy, setPolicy] = useState<SystemPolicy>({
    borrowLimit: 5,
    loanDuration: 14,
    reservationPeriod: 3,
    finePerDay: 1.0,
    maxRenewals: 2,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPolicy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await policyApi.getPolicy();
      if (res.success && res.data) {
        setPolicy(res.data);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await policyApi.updatePolicy({
        borrowLimit: Number(policy.borrowLimit),
        loanDuration: Number(policy.loanDuration),
        reservationPeriod: Number(policy.reservationPeriod),
        finePerDay: Number(policy.finePerDay),
        maxRenewals: Number(policy.maxRenewals),
      });
      if (res.success && res.data) {
        setPolicy(res.data);
        setSuccessMsg('System policy updated successfully and active immediately.');
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>System Borrowing & Fine Policy</h2>
          <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.88rem' }}>
            Configures operational constraints enforced across loan and reservation services.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchPolicy} disabled={loading || saving}>
          🔄 Refresh
        </button>
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

      <div className="card">
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Borrow Limit (Max active loans per patron)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              className="form-control"
              required
              value={policy.borrowLimit}
              onChange={(e) => setPolicy({ ...policy, borrowLimit: Number(e.target.value) })}
            />
            <small style={{ color: '#57606a' }}>Default: 5 books</small>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Loan Duration (Days allowed per loan)
            </label>
            <input
              type="number"
              min="1"
              max="365"
              className="form-control"
              required
              value={policy.loanDuration}
              onChange={(e) => setPolicy({ ...policy, loanDuration: Number(e.target.value) })}
            />
            <small style={{ color: '#57606a' }}>Default: 14 days</small>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Reservation Hold Period (Days held for patron pickup)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              className="form-control"
              required
              value={policy.reservationPeriod}
              onChange={(e) => setPolicy({ ...policy, reservationPeriod: Number(e.target.value) })}
            />
            <small style={{ color: '#57606a' }}>Default: 3 days</small>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Fine Per Day ($ USD overdue fee charged per day)
            </label>
            <input
              type="number"
              step="0.25"
              min="0"
              max="100"
              className="form-control"
              required
              value={policy.finePerDay}
              onChange={(e) => setPolicy({ ...policy, finePerDay: Number(e.target.value) })}
            />
            <small style={{ color: '#57606a' }}>Default: $1.00 / day</small>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Max Renewals (Maximum renewals allowed per loan)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              className="form-control"
              required
              value={policy.maxRenewals}
              onChange={(e) => setPolicy({ ...policy, maxRenewals: Number(e.target.value) })}
            />
            <small style={{ color: '#57606a' }}>Default: 2 renewals</small>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#57606a' }}>
              {policy.updatedAt ? `Last updated: ${new Date(policy.updatedAt).toLocaleString()}` : ''}
            </span>
            <button type="submit" className="btn btn-primary" disabled={saving || loading}>
              {saving ? 'Saving Changes...' : 'Save Policy Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

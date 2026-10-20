import React, { useState, useEffect } from 'react';
import { finesApi } from '../api/fines.api';
import { Fine } from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';

export const FineSettlementsPage: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterUnpaid, setFilterUnpaid] = useState(true);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const fetchFines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await finesApi.getAllFines();
      setFines(res.data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handlePayFine = async (fine: Fine) => {
    if (!window.confirm(`Confirm payment settlement of $${Number(fine.amount).toFixed(2)}?`)) {
      return;
    }
    setSettlingId(fine.id);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await finesApi.markAsPaid(fine.id);
      if (res.success) {
        setSuccessMsg(`Payment of $${Number(fine.amount).toFixed(2)} recorded successfully.`);
        fetchFines();
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setSettlingId(null);
    }
  };

  const displayedFines = filterUnpaid ? fines.filter((f) => !f.isPaid) : fines;
  const totalOutstanding = fines
    .filter((f) => !f.isPaid)
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>💰 Fine Settlements & Payments</h2>
          <p>Collect cash/card payments for overdue fines, view patron debt, and clear loan balances</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchFines} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      {successMsg && (
        <div className="alert alert-success">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="alert-close">&times;</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid-3col" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="kpi-label">Outstanding Library Fines</div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>
            ${totalOutstanding.toFixed(2)}
          </div>
        </div>
        <div className="card">
          <div className="kpi-label">Unpaid Fine Records</div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>
            {fines.filter((f) => !f.isPaid).length}
          </div>
        </div>
        <div className="card">
          <div className="kpi-label">Settled Records</div>
          <div className="kpi-value" style={{ color: '#16a34a' }}>
            {fines.filter((f) => f.isPaid).length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '8px 14px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filterUnpaid}
            onChange={(e) => setFilterUnpaid(e.target.checked)}
          />
          Show Unpaid Only
        </label>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          (Showing {displayedFines.length} of {fines.length} total recorded fines)
        </span>
      </div>

      {/* Fines Table */}
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Patron</th>
              <th>Book Title</th>
              <th>Fine Amount</th>
              <th>Status</th>
              <th>Recorded Date</th>
              <th>Payment Date</th>
              <th>Desk Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && fines.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                  Loading fine records...
                </td>
              </tr>
            ) : displayedFines.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                  No fines found matching selection.
                </td>
              </tr>
            ) : (
              displayedFines.map((f) => (
                <tr key={f.id}>
                  <td>
                    <strong>{f.loan?.user?.name || 'Patron'}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {f.loan?.user?.registrationNumber}
                    </div>
                  </td>
                  <td>{f.loan?.copy?.book?.title || 'Book Title'}</td>
                  <td style={{ fontWeight: 700, color: f.isPaid ? '#16a34a' : '#ef4444' }}>
                    ${Number(f.amount).toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${f.isPaid ? 'badge-success' : 'badge-danger'}`}>
                      {f.isPaid ? 'PAID' : 'UNPAID'}
                    </span>
                  </td>
                  <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                  <td>{f.paidAt ? new Date(f.paidAt).toLocaleDateString() : '-'}</td>
                  <td>
                    {!f.isPaid ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handlePayFine(f)}
                        disabled={settlingId === f.id}
                      >
                        {settlingId === f.id ? 'Recording...' : '💵 Mark as Paid'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
                        ✓ Cleared
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

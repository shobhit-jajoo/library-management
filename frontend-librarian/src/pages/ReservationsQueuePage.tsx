import React, { useState, useEffect } from 'react';
import { reservationsApi } from '../api/reservations.api';
import { Reservation } from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';

export const ReservationsQueuePage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [sweeping, setSweeping] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reservationsApi.getReservations();
      setReservations(res.data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSweepExpired = async () => {
    setSweeping(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await reservationsApi.processExpired();
      setSuccessMsg(`Expired hold sweep complete: ${res.data?.expiredCount || 0} reservation(s) expired.`);
      fetchReservations();
    } catch (err: any) {
      setError(err);
    } finally {
      setSweeping(false);
    }
  };

  const handleCancelReservation = async (id: string, title: string) => {
    if (!window.confirm(`Cancel reservation for "${title}"?`)) return;
    setError(null);
    try {
      await reservationsApi.cancelReservation(id);
      setSuccessMsg(`Reservation for "${title}" cancelled.`);
      fetchReservations();
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📌 Patron Reservations Queue</h2>
          <p>Track title hold requests, hold expiry periods, allocated copies, and sweep stale reservations</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchReservations} disabled={loading}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSweepExpired} disabled={sweeping}>
            {sweeping ? 'Sweeping...' : '🧹 Process Expired Holds'}
          </button>
        </div>
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
          <div className="kpi-label">Active / Ready for Pickup</div>
          <div className="kpi-value" style={{ color: '#0284c7' }}>
            {reservations.filter((r) => r.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="card">
          <div className="kpi-label">Pending Waitlist</div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>
            {reservations.filter((r) => r.status === 'PENDING').length}
          </div>
        </div>
        <div className="card">
          <div className="kpi-label">Collected Holds</div>
          <div className="kpi-value" style={{ color: '#16a34a' }}>
            {reservations.filter((r) => r.status === 'COLLECTED').length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Patron</th>
              <th>Book Title</th>
              <th>Allocated Copy Barcode</th>
              <th>Status</th>
              <th>Hold Expires At</th>
              <th>Requested Date</th>
              <th>Desk Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && reservations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                  Loading reservations queue...
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
                  No reservations currently in the queue.
                </td>
              </tr>
            ) : (
              reservations.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.user?.name || 'Patron'}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {r.user?.registrationNumber}
                    </div>
                  </td>
                  <td><strong>{r.book?.title || 'Unknown Title'}</strong></td>
                  <td>
                    {r.copy?.barcode ? (
                      <code>{r.copy.barcode}</code>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Awaiting Available Copy</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === 'ACTIVE'
                          ? 'badge-primary'
                          : r.status === 'PENDING'
                          ? 'badge-warning'
                          : r.status === 'COLLECTED'
                          ? 'badge-success'
                          : 'badge-secondary'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.holdExpiresAt ? (
                      <span style={{ color: '#b45309', fontWeight: 600 }}>
                        {new Date(r.holdExpiresAt).toLocaleDateString()}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    {r.status === 'PENDING' || r.status === 'ACTIVE' ? (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancelReservation(r.id, r.book?.title || 'Book')}
                      >
                        Cancel Hold
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>-</span>
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

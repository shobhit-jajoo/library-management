import React, { useState, useEffect } from 'react';
import { loansApi } from '../api/loans.api';
import { Loan } from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';

export const LoansOverduePage: React.FC = () => {
  const [overdueLoans, setOverdueLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Renewing modal/action
  const [renewingId, setRenewingId] = useState<string | null>(null);

  const fetchOverdueLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loansApi.getOverdueLoans();
      setOverdueLoans(res.data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdueLoans();
  }, []);

  const handleSyncOverdue = async () => {
    setSyncing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await loansApi.syncOverdue();
      setSuccessMsg(`Overdue audit complete. Updated ${res.data?.updatedCount || 0} loan status(es).`);
      fetchOverdueLoans();
    } catch (err: any) {
      setError(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleRenewLoan = async (loanId: string) => {
    setRenewingId(loanId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await loansApi.renewLoan(loanId);
      if (res.success) {
        setSuccessMsg(`Loan renewed successfully! New Due Date: ${new Date(res.data?.dueDate || '').toLocaleDateString()}`);
        fetchOverdueLoans();
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>⏳ Overdue & Active Loans Desk</h2>
          <p>Monitor late returns, accrued fines, execute staff renewals, and sync overdue statuses</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchOverdueLoans} disabled={loading}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSyncOverdue} disabled={syncing}>
            {syncing ? 'Auditing...' : '⚡ Sync Overdue Statuses'}
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

      {/* Summary KPI */}
      <div className="grid-3col" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="kpi-label">Active Overdue Loans</div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>{overdueLoans.length}</div>
        </div>
        <div className="card">
          <div className="kpi-label">Loans with Accrued Fines</div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>
            {overdueLoans.filter((l) => l.fine && !l.fine.isPaid).length}
          </div>
        </div>
        <div className="card">
          <div className="kpi-label">Desk Action Needed</div>
          <div className="kpi-value" style={{ color: '#0284c7' }}>
            {overdueLoans.length > 0 ? 'Send Reminder' : 'All Clear'}
          </div>
        </div>
      </div>

      {/* Loans Table */}
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Patron</th>
              <th>Book Title</th>
              <th>Barcode</th>
              <th>Due Date</th>
              <th>Renew Count</th>
              <th>Accrued Fine</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && overdueLoans.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                  Loading overdue loans...
                </td>
              </tr>
            ) : overdueLoans.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#16a34a', fontWeight: 500 }}>
                  🎉 No overdue loans currently in the library system!
                </td>
              </tr>
            ) : (
              overdueLoans.map((loan) => (
                <tr key={loan.id}>
                  <td>
                    <strong>{loan.user?.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {loan.user?.registrationNumber} &bull; {loan.user?.email}
                    </div>
                  </td>
                  <td><strong>{loan.copy?.book?.title || 'Unknown Title'}</strong></td>
                  <td><code>{loan.copy?.barcode}</code></td>
                  <td style={{ color: '#ef4444', fontWeight: 600 }}>
                    {new Date(loan.dueDate).toLocaleDateString()}
                  </td>
                  <td>{loan.renewCount}</td>
                  <td>
                    {loan.fine ? (
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>
                        ${Number(loan.fine.amount).toFixed(2)}
                      </span>
                    ) : (
                      <span style={{ color: '#64748b' }}>None</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRenewLoan(loan.id)}
                      disabled={renewingId === loan.id}
                    >
                      {renewingId === loan.id ? 'Renewing...' : '🔄 Renew Loan'}
                    </button>
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

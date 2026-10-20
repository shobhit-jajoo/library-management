import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/reports.api';
import {
  CirculationReport,
  OverdueReportItem,
  FinesReport,
  BorrowingStatisticsReport,
} from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';

type ReportTab = 'circulation' | 'overdue' | 'fines' | 'statistics';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('circulation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Date filters
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Report Data States
  const [circulation, setCirculation] = useState<CirculationReport | null>(null);
  const [overdue, setOverdue] = useState<OverdueReportItem[] | null>(null);
  const [fines, setFines] = useState<FinesReport | null>(null);
  const [stats, setStats] = useState<BorrowingStatisticsReport | null>(null);

  const fetchCurrentReport = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'circulation') {
        const res = await reportsApi.getCirculationReport(from || undefined, to || undefined);
        setCirculation(res.data || null);
      } else if (activeTab === 'overdue') {
        const res = await reportsApi.getOverdueReport();
        setOverdue(res.data || null);
      } else if (activeTab === 'fines') {
        const res = await reportsApi.getFinesReport(from || undefined, to || undefined);
        setFines(res.data || null);
      } else if (activeTab === 'statistics') {
        const res = await reportsApi.getBorrowingStatistics();
        setStats(res.data || null);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentReport();
  }, [activeTab]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCurrentReport();
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'circulation':
        return circulation;
      case 'overdue':
        return overdue;
      case 'fines':
        return fines;
      case 'statistics':
        return stats;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>System Reports & Analytics</h2>
          <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.88rem' }}>
            Inspect administrative metrics for loans, overdue inventory, fines, and title popularity.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showRawJson}
              onChange={(e) => setShowRawJson(e.target.checked)}
            />
            Show Raw JSON
          </label>
          <button className="btn btn-secondary btn-sm" onClick={fetchCurrentReport} disabled={loading}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #d0d7de', marginBottom: 16 }}>
        <button
          className={`btn ${activeTab === 'circulation' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '4px 4px 0 0' }}
          onClick={() => setActiveTab('circulation')}
        >
          Circulation
        </button>
        <button
          className={`btn ${activeTab === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '4px 4px 0 0' }}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue Loans
        </button>
        <button
          className={`btn ${activeTab === 'fines' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '4px 4px 0 0' }}
          onClick={() => setActiveTab('fines')}
        >
          Fines & Payments
        </button>
        <button
          className={`btn ${activeTab === 'statistics' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '4px 4px 0 0' }}
          onClick={() => setActiveTab('statistics')}
        >
          Borrowing Statistics
        </button>
      </div>

      {/* Optional Date Filter (applicable to Circulation & Fines) */}
      {(activeTab === 'circulation' || activeTab === 'fines') && (
        <div className="card" style={{ padding: '8px 12px', marginBottom: 16, backgroundColor: '#f6f8fa' }}>
          <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Date Range:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.78rem' }}>From:</span>
              <input
                type="date"
                className="form-control"
                style={{ padding: '2px 6px', fontSize: '0.8rem' }}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.78rem' }}>To:</span>
              <input
                type="date"
                className="form-control"
                style={{ padding: '2px 6px', fontSize: '0.8rem' }}
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '3px 8px' }}>
              Apply Filter
            </button>
            {(from || to) && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 8px' }}
                onClick={() => {
                  setFrom('');
                  setTo('');
                  setTimeout(fetchCurrentReport, 0);
                }}
              >
                Clear
              </button>
            )}
          </form>
        </div>
      )}

      {/* Raw JSON View if toggled */}
      {showRawJson && (
        <div className="card" style={{ marginBottom: 16, backgroundColor: '#1e1e1e', color: '#d4d4d4' }}>
          <div style={{ fontWeight: 600, color: '#58a6ff', marginBottom: 6, fontSize: '0.85rem' }}>
            Raw API Response:
          </div>
          <pre style={{ margin: 0, maxHeight: 300, overflow: 'auto', fontSize: '0.78rem' }}>
            {JSON.stringify(getActiveData(), null, 2)}
          </pre>
        </div>
      )}

      {/* Content Rendering by Active Tab */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>Loading report data...</div>
      ) : (
        <div>
          {/* TAB 1: CIRCULATION */}
          {activeTab === 'circulation' && circulation && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="card">
                <div style={{ fontSize: '0.85rem', color: '#57606a' }}>Total Loans</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0969da' }}>
                  {circulation.totalLoans}
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: '0.85rem', color: '#57606a' }}>Active Loans</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a7f37' }}>
                  {circulation.activeLoans}
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: '0.85rem', color: '#57606a' }}>Returned Loans</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#57606a' }}>
                  {circulation.returnedLoans}
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: '0.85rem', color: '#57606a' }}>Overdue Loans</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#cf222e' }}>
                  {circulation.overdueLoans}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OVERDUE */}
          {activeTab === 'overdue' && overdue && (
            <div className="card" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Patron</th>
                    <th>Book</th>
                    <th>Barcode</th>
                    <th>Due Date</th>
                    <th>Days Overdue</th>
                    <th>Accrued Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#57606a' }}>
                        No overdue loans currently found.
                      </td>
                    </tr>
                  ) : (
                    overdue.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td>
                          <strong>{item.patron?.name}</strong> ({item.patron?.registrationNumber})
                        </td>
                        <td>{item.book?.title}</td>
                        <td><code>{item.book?.barcode}</code></td>
                        <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                        <td style={{ color: '#cf222e', fontWeight: 600 }}>{item.daysOverdue} days</td>
                        <td style={{ color: '#cf222e', fontWeight: 600 }}>${Number(item.accruedFine).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: FINES */}
          {activeTab === 'fines' && fines && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="card">
                <div style={{ fontSize: '0.85rem', color: '#57606a' }}>Total Fines Accrued</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#cf222e' }}>
                  ${Number(fines.totalFinesAccrued || 0).toFixed(2)}
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: '0.85rem', color: '#57606a' }}>Total Fines Paid</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a7f37' }}>
                  ${Number(fines.totalFinesPaid || 0).toFixed(2)}
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: '0.85rem', color: '#57606a' }}>Outstanding Fines</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#d29922' }}>
                  ${Number(fines.outstandingFines || 0).toFixed(2)}
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: '0.85rem', color: '#57606a' }}>Transactions Count</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0969da' }}>
                  {fines.transactionsCount || 0}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BORROWING STATISTICS */}
          {activeTab === 'statistics' && stats && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="card">
                  <div style={{ fontSize: '0.85rem', color: '#57606a' }}>Total Unique Borrowers</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0969da' }}>
                    {stats.totalUniqueBorrowers}
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '0.85rem', color: '#57606a' }}>Avg. Loan Duration</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a7f37' }}>
                    {Number(stats.averageLoanDurationDays || 0).toFixed(1)} days
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #d0d7de', fontWeight: 600 }}>
                  Top Borrowed Titles
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Borrow Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.mostBorrowedBooks?.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#57606a' }}>
                          No borrowing records available yet.
                        </td>
                      </tr>
                    ) : (
                      stats.mostBorrowedBooks?.map((b) => (
                        <tr key={b.id}>
                          <td><strong>{b.title}</strong></td>
                          <td>{b.author}</td>
                          <td style={{ fontWeight: 600, color: '#0969da' }}>{b.borrowCount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

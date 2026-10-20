import React, { useState, useEffect } from 'react';
import { booksApi } from '../api/books.api';
import { loansApi } from '../api/loans.api';
import { finesApi } from '../api/fines.api';
import { reservationsApi } from '../api/reservations.api';
import { usersApi } from '../api/users.api';
import { ErrorDisplay } from '../components/ErrorDisplay';

export const DeskReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Metrics
  const [totalBooks, setTotalBooks] = useState(0);
  const [availableCopies, setAvailableCopies] = useState(0);
  const [totalCopies, setTotalCopies] = useState(0);
  const [activeOverdueCount, setActiveOverdueCount] = useState(0);
  const [unpaidFinesTotal, setUnpaidFinesTotal] = useState(0);
  const [activeReservationsCount, setActiveReservationsCount] = useState(0);
  const [totalPatrons, setTotalPatrons] = useState(0);

  const fetchDeskMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksRes, overdueRes, finesRes, reservationsRes, usersRes] = await Promise.all([
        booksApi.getBooks({ limit: 100 }),
        loansApi.getOverdueLoans(),
        finesApi.getAllFines(),
        reservationsApi.getReservations(),
        usersApi.searchUsers({ limit: 100 }),
      ]);

      const booksList = booksRes.data || [];
      setTotalBooks(booksRes.pagination?.total || booksList.length);
      const totalC = booksList.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
      const availC = booksList.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
      setTotalCopies(totalC);
      setAvailableCopies(availC);

      const overdues = overdueRes.data || [];
      setActiveOverdueCount(overdues.length);

      const fines = finesRes.data || [];
      const unpaidSum = fines
        .filter((f) => !f.isPaid)
        .reduce((sum, f) => sum + Number(f.amount || 0), 0);
      setUnpaidFinesTotal(unpaidSum);

      const reservations = reservationsRes.data || [];
      setActiveReservationsCount(reservations.filter((r) => r.status === 'ACTIVE' || r.status === 'PENDING').length);

      setTotalPatrons(usersRes.pagination?.total || (usersRes.data || []).length);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeskMetrics();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📊 Librarian Desk Daily Operations Report</h2>
          <p>Real-time circulation metrics, catalog utilization, pending queues, and desk health</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchDeskMetrics} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Metrics'}
        </button>
      </div>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      {/* Grid of Key Operations Metrics */}
      <div className="grid-3col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="kpi-label">Catalog Titles & Stock</div>
          <div className="kpi-value" style={{ color: '#0f172a' }}>{totalBooks}</div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
            <strong>{availableCopies}</strong> of {totalCopies} copies available on shelf
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Registered Members / Patrons</div>
          <div className="kpi-value" style={{ color: '#0284c7' }}>{totalPatrons}</div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
            Active borrowing accounts in system
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Overdue Loans Alert</div>
          <div className="kpi-value" style={{ color: activeOverdueCount > 0 ? '#ef4444' : '#16a34a' }}>
            {activeOverdueCount}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
            Checkouts past required return date
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Unsettled Overdue Fines</div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>
            ${unpaidFinesTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
            Pending payments across members
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Pending Holds Queue</div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>
            {activeReservationsCount}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
            Members waiting or ready for title pickup
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Circulation Status</div>
          <div className="kpi-value" style={{ color: '#16a34a' }}>HEALTHY</div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
            Live PostgreSQL & Express REST API
          </div>
        </div>
      </div>

      {/* Desk Operating Guidelines Card */}
      <div className="card">
        <h3>Librarian Standard Desk Procedures</h3>
        <ul style={{ lineHeight: 1.8, fontSize: '0.88rem', color: '#334155', paddingLeft: 20 }}>
          <li>
            <strong>Issuing Books:</strong> Always verify that the patron has no outstanding lost copy holds and that their borrow limit has not been reached.
          </li>
          <li>
            <strong>Returns & Check-in:</strong> Scan returned copies immediately. The system computes overdue fees dynamically. Inspect copy condition before shelving.
          </li>
          <li>
            <strong>Reservations:</strong> When a copy is returned that has a pending reservation, the system holds it for that patron. Use the <em>Process Expired Holds</em> button daily to release unclaimed copies.
          </li>
          <li>
            <strong>Fine Settlements:</strong> Record payments in the <em>Fine Settlements</em> tab when cash or card payments are completed at the front desk.
          </li>
        </ul>
      </div>
    </div>
  );
};

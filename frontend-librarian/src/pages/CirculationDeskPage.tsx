import React, { useState } from 'react';
import { loansApi } from '../api/loans.api';
import { booksApi } from '../api/books.api';
import { usersApi } from '../api/users.api';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { BookCopy, User, Loan } from '../types';

export const CirculationDeskPage: React.FC = () => {
  // Mode: issue or return
  const [activeMode, setActiveMode] = useState<'issue' | 'return'>('issue');

  // Issue states
  const [patronSearch, setPatronSearch] = useState('');
  const [foundPatrons, setFoundPatrons] = useState<User[]>([]);
  const [selectedPatron, setSelectedPatron] = useState<User | null>(null);
  const [patronLoans, setPatronLoans] = useState<Loan[]>([]);
  const [issueBarcode, setIssueBarcode] = useState('');
  const [verifiedCopy, setVerifiedCopy] = useState<BookCopy | null>(null);

  // Return states
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnResult, setReturnResult] = useState<any>(null);

  // Common feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search Patron
  const handleSearchPatron = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronSearch.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await usersApi.searchUsers({ search: patronSearch.trim(), limit: 5 });
      setFoundPatrons(res.data || []);
      if (!res.data || res.data.length === 0) {
        setError('No patron found matching "' + patronSearch + '"');
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatron = async (user: User) => {
    setSelectedPatron(user);
    setFoundPatrons([]);
    setError(null);
    // Load existing active loans for this patron
    try {
      const res = await usersApi.getUserLoans(user.id);
      setPatronLoans(res.data || []);
    } catch {
      // ignore
    }
  };

  // Verify barcode before issue
  const handleVerifyBarcode = async () => {
    if (!issueBarcode.trim()) return;
    setError(null);
    try {
      const res = await booksApi.getCopyByBarcode(issueBarcode.trim());
      if (res.data) {
        setVerifiedCopy(res.data);
      }
    } catch (err: any) {
      setError(err);
      setVerifiedCopy(null);
    }
  };

  // Perform Book Issue
  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatron) {
      setError('Please search and select a patron first.');
      return;
    }
    if (!issueBarcode.trim()) {
      setError('Please provide a book copy barcode.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await loansApi.issueBook(selectedPatron.id, issueBarcode.trim());
      if (res.success) {
        setSuccessMsg(
          `Success! Book copy '${issueBarcode}' issued to ${selectedPatron.name}. Due date: ${new Date(
            res.data?.dueDate || ''
          ).toLocaleDateString()}`
        );
        setIssueBarcode('');
        setVerifiedCopy(null);
        // Refresh patron loans
        const loansRes = await usersApi.getUserLoans(selectedPatron.id);
        setPatronLoans(loansRes.data || []);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Perform Book Return
  const handleReturnBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnBarcode.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setReturnResult(null);

    try {
      const res = await loansApi.returnBook(returnBarcode.trim());
      if (res.success) {
        setReturnResult(res.data);
        setSuccessMsg(`Book with barcode '${returnBarcode}' successfully returned to inventory!`);
        setReturnBarcode('');
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>⚡ Circulation Desk (Issue & Return)</h2>
          <p>Instant check-out, returns, overdue fine calculation, and live barcode verification</p>
        </div>
        <div className="tab-switcher">
          <button
            className={`btn ${activeMode === 'issue' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveMode('issue');
              setError(null);
              setSuccessMsg(null);
            }}
          >
            📤 Issue Book to Patron
          </button>
          <button
            className={`btn ${activeMode === 'return' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveMode('return');
              setError(null);
              setSuccessMsg(null);
            }}
          >
            📥 Accept Return from Patron
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

      {/* MODE 1: ISSUE BOOK */}
      {activeMode === 'issue' && (
        <div className="grid-2col">
          {/* Step 1: Select Patron */}
          <div className="card">
            <div className="card-header">
              <h3>Step 1: Identify Patron</h3>
            </div>
            <form onSubmit={handleSearchPatron} className="search-bar" style={{ marginBottom: 12 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, or RegNo (e.g. USR-001)..."
                value={patronSearch}
                onChange={(e) => setPatronSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary" disabled={loading}>
                Search
              </button>
            </form>

            {foundPatrons.length > 0 && (
              <div className="patron-results">
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                  Select Patron:
                </div>
                {foundPatrons.map((p) => (
                  <div
                    key={p.id}
                    className="patron-result-item"
                    onClick={() => handleSelectPatron(p)}
                  >
                    <div>
                      <strong>{p.name}</strong> ({p.registrationNumber})
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
                    </div>
                    <span className="badge badge-primary">{p.status}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedPatron ? (
              <div className="selected-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{selectedPatron.name}</strong>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setSelectedPatron(null);
                      setPatronLoans([]);
                    }}
                  >
                    Change Patron
                  </button>
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: 6, color: '#334155' }}>
                  <div>Reg No: <strong>{selectedPatron.registrationNumber}</strong></div>
                  <div>Email: <strong>{selectedPatron.email}</strong></div>
                  <div>Role: <span className="badge badge-user">{selectedPatron.role}</span></div>
                  <div>Status: <span className="badge badge-success">{selectedPatron.status}</span></div>
                </div>

                <div style={{ marginTop: 12, borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                    Active Loans ({patronLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE').length}):
                  </div>
                  {patronLoans.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                      No current or previous loans.
                    </div>
                  ) : (
                    <ul style={{ paddingLeft: 16, margin: '4px 0 0 0', fontSize: '0.8rem' }}>
                      {patronLoans.slice(0, 4).map((loan) => (
                        <li key={loan.id} style={{ color: loan.status === 'OVERDUE' ? '#ef4444' : '#334155' }}>
                          {loan.copy?.book?.title || 'Book'} ({loan.copy?.barcode}) - Due: {new Date(loan.dueDate).toLocaleDateString()} [{loan.status}]
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="placeholder-box">
                Search and select a patron to proceed with issuing.
              </div>
            )}
          </div>

          {/* Step 2: Scan Copy & Issue */}
          <div className="card">
            <div className="card-header">
              <h3>Step 2: Scan Copy Barcode & Issue</h3>
            </div>
            <form onSubmit={handleIssueBook}>
              <div className="form-group">
                <label>Book Copy Barcode *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Scan or type barcode (e.g. BC-001)..."
                    value={issueBarcode}
                    onChange={(e) => setIssueBarcode(e.target.value)}
                    onBlur={handleVerifyBarcode}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleVerifyBarcode}>
                    Verify
                  </button>
                </div>
              </div>

              {verifiedCopy && (
                <div className="verified-box">
                  <div style={{ fontWeight: 600, color: '#0369a1' }}>
                    📖 {verifiedCopy.book?.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: 4 }}>
                    <div>Author: {verifiedCopy.book?.author}</div>
                    <div>Barcode: <code>{verifiedCopy.barcode}</code></div>
                    <div>Status: <span className="badge badge-success">{verifiedCopy.status}</span></div>
                    <div>Condition: {verifiedCopy.condition} | Location: {verifiedCopy.location || 'Main'}</div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                style={{ marginTop: 16 }}
                disabled={loading || !selectedPatron || !issueBarcode.trim()}
              >
                {loading ? 'Processing Issue...' : '✅ Complete Book Check-Out'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODE 2: ACCEPT RETURN */}
      {activeMode === 'return' && (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <h3>Accept Returned Book</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                Scan or enter the book copy barcode. Overdue fines will be calculated automatically.
              </p>
            </div>

            <form onSubmit={handleReturnBook}>
              <div className="form-group">
                <label>Book Barcode *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="Scan returned book barcode (e.g. BC-001)..."
                  value={returnBarcode}
                  onChange={(e) => setReturnBarcode(e.target.value)}
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading || !returnBarcode.trim()}>
                {loading ? 'Checking in Book...' : '📥 Accept Book Return'}
              </button>
            </form>

            {returnResult && (
              <div className="return-result-card">
                <h4>Check-In Receipt</h4>
                <div style={{ fontSize: '0.85rem' }}>
                  <div>Status: <strong>Returned & Available</strong></div>
                  <div>Patron: <strong>{returnResult.loan?.user?.name}</strong> ({returnResult.loan?.user?.registrationNumber})</div>
                  <div>Return Date: {new Date().toLocaleString()}</div>
                  {returnResult.fine ? (
                    <div className="fine-warning">
                      ⚠️ <strong>Overdue Fine Assessed: ${Number(returnResult.fine.amount).toFixed(2)}</strong>
                      <div style={{ fontSize: '0.75rem' }}>
                        Fine ID: {returnResult.fine.id} - Proceed to Fine Settlements tab to record payment.
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#16a34a', marginTop: 6 }}>
                      ✅ Returned on time! No overdue fines accrued.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

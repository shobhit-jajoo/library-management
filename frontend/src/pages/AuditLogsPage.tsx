import React, { useState, useEffect } from 'react';
import { auditApi } from '../api/audit.api';
import { AuditLog } from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { Pagination } from '../components/Pagination';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Selected Log Drawer / Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditApi.getAuditLogs({
        page,
        limit,
        action: actionFilter.trim() || undefined,
        entityType: entityTypeFilter.trim() || undefined,
        userId: userIdFilter.trim() || undefined,
      });
      if (res.success && res.data) {
        setLogs(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
          setTotalRecords(res.pagination.total);
        }
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAuditLogs();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>System Audit Logs</h2>
          <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.88rem' }}>
            Immutable security and administrative event ledger (<code>GET /api/v1/audit</code>).
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAuditLogs} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      {/* Filter Bar */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 16 }}>
        <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ minWidth: 150 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Action (e.g. USER_LOGIN)..."
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 140 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Entity (e.g. User, Loan)..."
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 180 }}>
            <input
              type="text"
              className="form-control"
              placeholder="User ID / Actor..."
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Filter
          </button>
          {(actionFilter || entityTypeFilter || userIdFilter) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setActionFilter('');
                setEntityTypeFilter('');
                setUserIdFilter('');
                setPage(1);
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Audit Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table" style={{ fontSize: '0.83rem' }}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Role</th>
              <th>Action</th>
              <th>Entity</th>
              <th>IP Address</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                  Loading audit trail...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#57606a' }}>
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    {log.user ? (
                      <span>
                        <strong>{log.user.name}</strong> ({log.user.registrationNumber})
                      </span>
                    ) : (
                      <span style={{ color: '#57606a' }}>{log.userId || 'System'}</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        log.userRole === 'ADMINISTRATOR'
                          ? 'badge-admin'
                          : log.userRole === 'LIBRARIAN'
                          ? 'badge-librarian'
                          : 'badge-patron'
                      }`}
                    >
                      {log.userRole || 'SYSTEM'}
                    </span>
                  </td>
                  <td>
                    <code>{log.action}</code>
                  </td>
                  <td>
                    {log.entityType} {log.entityId ? `(#${log.entityId.substring(0, 8)})` : ''}
                  </td>
                  <td>{log.ipAddress || '-'}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '1px 6px', fontSize: '0.72rem' }}
                      onClick={() => setSelectedLog(log)}
                    >
                      Inspect JSON
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={totalRecords}
        limit={limit}
        onPageChange={(p) => setPage(p)}
      />

      {/* Detail Modal */}
      {selectedLog && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 650 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Audit Entry: {selectedLog.action}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', margin: '8px 0 12px 0' }}>
              <div><strong>Time:</strong> {new Date(selectedLog.createdAt).toLocaleString()}</div>
              <div><strong>Actor:</strong> {selectedLog.user?.name || selectedLog.userId} ({selectedLog.userRole})</div>
              <div><strong>Entity:</strong> {selectedLog.entityType} ID: {selectedLog.entityId || 'N/A'}</div>
              <div><strong>IP / UA:</strong> {selectedLog.ipAddress || '-'} | {selectedLog.userAgent || '-'}</div>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>
              Payload Details:
            </div>
            <pre
              style={{
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                padding: 10,
                borderRadius: 4,
                maxHeight: 280,
                overflow: 'auto',
                fontSize: '0.8rem',
              }}
            >
              {JSON.stringify(selectedLog.details, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

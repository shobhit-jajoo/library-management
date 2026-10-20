import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../api/notifications.api';
import { Notification } from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { Pagination } from '../components/Pagination';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationsApi.getNotifications({
        page,
        limit,
        unreadOnly: unreadOnly || undefined,
      });
      if (res.success && res.data) {
        setNotifications(res.data);
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
    fetchNotifications();
  }, [page, unreadOnly]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      fetchNotifications();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>System Notifications</h2>
          <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.88rem' }}>
            In-app notifications for overdue alerts, reservation holds, and administrative broadcasts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            Mark All as Read
          </button>
          <button className="btn btn-secondary btn-sm" onClick={fetchNotifications} disabled={loading}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 12 }}>
        <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
          />
          Show Unread Only
        </label>
      </div>

      {/* Notifications List */}
      <div className="card" style={{ padding: 0 }}>
        {loading && notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24 }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#57606a' }}>
            No notifications found.
          </div>
        ) : (
          <div>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #eee',
                  backgroundColor: n.isRead ? '#ffffff' : '#f0f7ff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: '0.92rem' }}>{n.title}</strong>
                    {!n.isRead && (
                      <span className="badge badge-admin" style={{ fontSize: '0.7rem' }}>
                        NEW
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#333', marginTop: 4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#57606a', marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                    onClick={() => handleMarkRead(n.id)}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={totalRecords}
        limit={limit}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

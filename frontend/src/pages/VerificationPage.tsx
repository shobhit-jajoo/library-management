import React, { useState, useEffect } from 'react';

interface ChecklistItem {
  id: string;
  category: string;
  name: string;
  description: string;
  checked: boolean;
}

const DEFAULT_ITEMS: Omit<ChecklistItem, 'checked'>[] = [
  // 1. Authentication & Session (7 items)
  { id: 'auth_1', category: 'Authentication', name: 'Admin Login via Email', description: 'Authenticate using admin@library.local and receive JWT' },
  { id: 'auth_2', category: 'Authentication', name: 'Admin Login via RegNo', description: 'Authenticate using ADM-001 and receive JWT' },
  { id: 'auth_3', category: 'Authentication', name: 'Invalid Credentials Rejection', description: 'Receive 401 Unauthorized with descriptive error message' },
  { id: 'auth_4', category: 'Authentication', name: 'Get Current Profile (Me)', description: 'Retrieve authenticated admin profile via GET /auth/me' },
  { id: 'auth_5', category: 'Authentication', name: 'Change Password Flow', description: 'Update admin password via POST /auth/change-password' },
  { id: 'auth_6', category: 'Authentication', name: 'Admin Logout', description: 'Clear server and local tokens via POST /auth/logout' },
  { id: 'auth_7', category: 'Authentication', name: 'Health Endpoint Checks', description: 'Verify /health and /health/db return 200 OK' },

  // 2. User Management (9 items)
  { id: 'user_1', category: 'User Management', name: 'List Users with Pagination', description: 'Fetch users with page and limit parameters' },
  { id: 'user_2', category: 'User Management', name: 'Search Users by Query', description: 'Filter users by partial name or email' },
  { id: 'user_3', category: 'User Management', name: 'Filter Users by Role', description: 'Filter users by USER, LIBRARIAN, or ADMINISTRATOR' },
  { id: 'user_4', category: 'User Management', name: 'Filter Users by Status', description: 'Filter users by ACTIVE or INACTIVE' },
  { id: 'user_5', category: 'User Management', name: 'Create Patron/User Account', description: 'Admin creates a new USER account' },
  { id: 'user_6', category: 'User Management', name: 'Update User Profile', description: 'Admin modifies user name, email, or phone number' },
  { id: 'user_7', category: 'User Management', name: 'Deactivate User Account', description: 'Admin deactivates an active user (POST /admin/users/:id/deactivate)' },
  { id: 'user_8', category: 'User Management', name: 'Activate User Account', description: 'Admin reactivates an inactive user (POST /admin/users/:id/activate)' },
  { id: 'user_9', category: 'User Management', name: 'Duplicate RegNo/Email Error', description: 'Backend rejects duplicates with 409 Conflict' },

  // 3. Staff & Librarian Management (3 items)
  { id: 'lib_1', category: 'Staff Management', name: 'Create Staff Librarian', description: 'Admin creates a librarian via POST /admin/librarians' },
  { id: 'lib_2', category: 'Staff Management', name: 'Verify Librarian Role', description: 'Created librarian immediately possesses LIBRARIAN role' },
  { id: 'lib_3', category: 'Staff Management', name: 'Librarian Audit Record', description: 'Audit trail records USER_CREATED for the librarian' },

  // 4. System Borrowing Policy (5 items)
  { id: 'pol_1', category: 'System Policy', name: 'Get Current Policy', description: 'Retrieve policy via GET /admin/policy' },
  { id: 'pol_2', category: 'System Policy', name: 'Update Borrow Limit', description: 'Modify borrowLimit via PATCH /admin/policy' },
  { id: 'pol_3', category: 'System Policy', name: 'Update Loan Duration', description: 'Modify loanDuration via PATCH /admin/policy' },
  { id: 'pol_4', category: 'System Policy', name: 'Update Overdue Fine Per Day', description: 'Modify finePerDay via PATCH /admin/policy' },
  { id: 'pol_5', category: 'System Policy', name: 'Update Max Renewals', description: 'Modify maxRenewals via PATCH /admin/policy' },

  // 5. System Reports (6 items)
  { id: 'rep_1', category: 'Reports', name: 'Circulation Report Summary', description: 'Fetch loan totals and breakdown via GET /admin/reports/circulation' },
  { id: 'rep_2', category: 'Reports', name: 'Circulation Date Range Filter', description: 'Filter circulation metrics with ?from= & ?to=' },
  { id: 'rep_3', category: 'Reports', name: 'Overdue Loans Report', description: 'Inspect overdue list with patron, title, and accrued fines' },
  { id: 'rep_4', category: 'Reports', name: 'Fines & Payments Report', description: 'Fetch fines collected and outstanding via GET /admin/reports/fines' },
  { id: 'rep_5', category: 'Reports', name: 'Borrowing Statistics', description: 'Fetch most borrowed books and average loan days' },
  { id: 'rep_6', category: 'Reports', name: 'Raw JSON Report Toggle', description: 'Toggle raw API responses for auditing accuracy' },

  // 6. Books & Inventory Management (8 items)
  { id: 'book_1', category: 'Books & Inventory', name: 'List Books with Search', description: 'Search books by title, author, or ISBN' },
  { id: 'book_2', category: 'Books & Inventory', name: 'Create New Book', description: 'Create book entry via POST /books' },
  { id: 'book_3', category: 'Books & Inventory', name: 'Update Book Metadata', description: 'Update book details via PATCH /books/:id' },
  { id: 'book_4', category: 'Books & Inventory', name: 'Delete Book Entry', description: 'Remove book record via DELETE /books/:id' },
  { id: 'book_5', category: 'Books & Inventory', name: 'List Book Copies', description: 'Fetch physical copies for a book via GET /books/:id/copies' },
  { id: 'book_6', category: 'Books & Inventory', name: 'Add Physical Book Copy', description: 'Register new barcode copy via POST /books/:id/copies' },
  { id: 'book_7', category: 'Books & Inventory', name: 'Update Copy Status/Condition', description: 'Change copy status via PATCH /book-copies/:id' },
  { id: 'book_8', category: 'Books & Inventory', name: 'Barcode Lookup', description: 'Direct lookup via GET /book-copies/barcode/:barcode' },

  // 7. Audit Logging (5 items)
  { id: 'aud_1', category: 'Audit Logs', name: 'Fetch Audit Logs List', description: 'Retrieve audit trail via GET /audit with pagination' },
  { id: 'aud_2', category: 'Audit Logs', name: 'Filter by Action', description: 'Filter audit trail by action (e.g. USER_LOGIN, BOOK_CREATED)' },
  { id: 'aud_3', category: 'Audit Logs', name: 'Filter by Entity Type', description: 'Filter audit trail by entity (e.g. User, Book, Policy)' },
  { id: 'aud_4', category: 'Audit Logs', name: 'Inspect Audit Payload JSON', description: 'View full request metadata and IP details' },
  { id: 'aud_5', category: 'Audit Logs', name: 'Immutability Verification', description: 'Confirm audit entries cannot be modified or deleted' },

  // 8. Security & RBAC Enforcement (6 items)
  { id: 'sec_1', category: 'RBAC & Security', name: 'Admin Policy 401 on Anonymous', description: 'Verify anonymous GET /admin/policy returns 401' },
  { id: 'sec_2', category: 'RBAC & Security', name: 'Audit Logs 401 on Anonymous', description: 'Verify anonymous GET /audit returns 401' },
  { id: 'sec_3', category: 'RBAC & Security', name: 'Users List 401 on Anonymous', description: 'Verify anonymous GET /admin/users returns 401' },
  { id: 'sec_4', category: 'RBAC & Security', name: 'Debug Panel Credential Redaction', description: 'Authorization header displayed as Bearer [REDACTED]' },
  { id: 'sec_5', category: 'RBAC & Security', name: 'Sensitive Field Sanitization', description: 'Passwords and refresh tokens never saved in debug logs' },
  { id: 'sec_6', category: 'RBAC & Security', name: 'No Refresh Token in localStorage', description: 'Confirm local storage only holds short-lived accessToken' },
];

const STORAGE_KEY = 'lms_admin_verification_checklist_v1';

export const VerificationPage: React.FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return DEFAULT_ITEMS.map((item) => ({
          ...item,
          checked: !!parsed[item.id],
        }));
      } catch {
        // Fall through
      }
    }
    return DEFAULT_ITEMS.map((item) => ({ ...item, checked: false }));
  });

  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const item of items) {
      map[item.id] = item.checked;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all 49 checklist items?')) {
      setItems(DEFAULT_ITEMS.map((item) => ({ ...item, checked: false })));
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleCheckAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: true })));
  };

  const totalChecked = items.filter((i) => i.checked).length;
  const progressPercent = Math.round((totalChecked / items.length) * 100);

  // Group by category
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Administrator Verification Checklist (49 Items)</h2>
          <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.88rem' }}>
            Systematic verification progress across all administrative features and security requirements.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleCheckAll}>
            Select All
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleReset}>
            Reset All
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            Completion Progress: {totalChecked} of {items.length} verified ({progressPercent}%)
          </span>
          <span
            className={`badge ${progressPercent === 100 ? 'badge-success' : 'badge-admin'}`}
            style={{ fontSize: '0.8rem' }}
          >
            {progressPercent === 100 ? 'COMPLETE (49/49)' : `${progressPercent}% COMPLETED`}
          </span>
        </div>
        <div
          style={{
            height: 12,
            backgroundColor: '#eaeef2',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: progressPercent === 100 ? '#2da44e' : '#0969da',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          const catChecked = catItems.filter((i) => i.checked).length;
          return (
            <div key={cat} className="card" style={{ padding: 12 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                  borderBottom: '1px solid #eee',
                  paddingBottom: 6,
                }}
              >
                <strong style={{ fontSize: '0.92rem' }}>{cat}</strong>
                <span style={{ fontSize: '0.75rem', color: '#57606a' }}>
                  {catChecked}/{catItems.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {catItems.map((item) => (
                  <label
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: 4,
                      backgroundColor: item.checked ? '#f0fdf4' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                      style={{ marginTop: 2 }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          textDecoration: item.checked ? 'line-through' : 'none',
                          color: item.checked ? '#1a7f37' : '#24292f',
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#57606a' }}>
                        {item.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

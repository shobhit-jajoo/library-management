import React, { useState, useEffect } from 'react';
import { usersApi } from '../api/users.api';
import { User, Loan } from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { Pagination } from '../components/Pagination';

export const PatronManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // User details / Borrowing history modal
  const [inspectUser, setInspectUser] = useState<User | null>(null);
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  // Create User Modal (if librarian wants to register new patron)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    registrationNumber: '',
    name: '',
    email: '',
    phoneNumber: '',
    password: 'Password123!',
    role: 'USER',
  });

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.searchUsers({
        page,
        limit,
        search: search.trim() || undefined,
      });
      if (res.success && res.data) {
        setUsers(res.data);
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
    fetchUsers();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleInspectUser = async (u: User) => {
    setInspectUser(u);
    setLoadingLoans(true);
    try {
      const res = await usersApi.getUserLoans(u.id);
      setUserLoans(res.data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoadingLoans(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await usersApi.createUser(createForm);
      if (res.success) {
        setSuccessMsg(`Patron ${res.data?.name} created successfully.`);
        setShowCreateModal(false);
        setCreateForm({
          registrationNumber: '',
          name: '',
          email: '',
          phoneNumber: '',
          password: 'Password123!',
          role: 'USER',
        });
        fetchUsers();
      }
    } catch (err: any) {
      setError(err);
    }
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      phoneNumber: u.phoneNumber || '',
      status: u.status,
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);
    try {
      await usersApi.updateUser(editingUser.id, editForm);
      setSuccessMsg(`Patron ${editForm.name} updated successfully.`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>👥 Patron Management & History</h2>
          <p>Search library patrons, view active/historical checkouts, register members, and update contacts</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers} disabled={loading}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            + Register New Patron
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

      {/* Search Bar */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 16 }}>
        <form onSubmit={handleSearchSubmit} className="search-bar">
          <input
            type="text"
            className="form-control"
            placeholder="Search by patron name, email, or registration number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
          {search && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setPage(1);
                setTimeout(fetchUsers, 0);
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Users Table */}
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>Reg No</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                  Loading patrons...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                  No patrons found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.registrationNumber}</strong></td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phoneNumber || '-'}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMINISTRATOR' ? 'badge-admin' : u.role === 'LIBRARIAN' ? 'badge-librarian' : 'badge-user'}`}>
                      {u.role === 'USER' ? 'PATRON' : u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleInspectUser(u)}
                      >
                        Borrowing Record
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(u)}
                      >
                        Edit
                      </button>
                    </div>
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

      {/* Patron Loans & Borrowing History Modal */}
      {inspectUser && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 780 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>Borrowing History: {inspectUser.name}</h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>
                  Reg: <strong>{inspectUser.registrationNumber}</strong> &bull; Email: {inspectUser.email}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setInspectUser(null)}>
                Close
              </button>
            </div>

            <div style={{ marginTop: 16 }}>
              {loadingLoans ? (
                <div style={{ padding: 20 }}>Loading borrowing records...</div>
              ) : userLoans.length === 0 ? (
                <div style={{ color: '#64748b', textAlign: 'center', padding: 24 }}>
                  This patron has no recorded loan transactions.
                </div>
              ) : (
                <table className="table" style={{ fontSize: '0.82rem' }}>
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Barcode</th>
                      <th>Issue Date</th>
                      <th>Due Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userLoans.map((loan) => (
                      <tr key={loan.id}>
                        <td><strong>{loan.copy?.book?.title || 'Unknown Title'}</strong></td>
                        <td><code>{loan.copy?.barcode || '-'}</code></td>
                        <td>{new Date(loan.issueDate).toLocaleDateString()}</td>
                        <td>{new Date(loan.dueDate).toLocaleDateString()}</td>
                        <td>{loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '-'}</td>
                        <td>
                          <span
                            className={`badge ${
                              loan.status === 'ACTIVE'
                                ? 'badge-primary'
                                : loan.status === 'RETURNED'
                                ? 'badge-success'
                                : 'badge-danger'
                            }`}
                          >
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Patron Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Register New Member / Patron</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Registration Number *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={createForm.registrationNumber}
                  onChange={(e) => setCreateForm({ ...createForm, registrationNumber: e.target.value })}
                  placeholder="e.g. USR-500"
                />
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Patron's full name"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="patron@example.com"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={createForm.phoneNumber}
                  onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                  placeholder="+1-555-0199"
                />
              </div>

              <div className="form-group">
                <label>Temporary Password *</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Patron
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patron Modal */}
      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Edit Patron: {editingUser.name}</h3>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Account Status</label>
                <select
                  className="form-control"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

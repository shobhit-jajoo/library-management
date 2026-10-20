import React, { useState, useEffect } from 'react';
import { usersApi } from '../api/users.api';
import { User, UserRole, UserStatus } from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { Pagination } from '../components/Pagination';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal / Form state for Create User
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    registrationNumber: '',
    name: '',
    email: '',
    phoneNumber: '',
    password: 'Password123!',
    role: 'USER' as UserRole,
  });

  // Modal / Form state for Edit User
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'USER' as UserRole,
    status: 'ACTIVE' as UserStatus,
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.getUsers({
        page,
        limit,
        search: search.trim() || undefined,
        role: (roleFilter as UserRole) || undefined,
        status: (statusFilter as UserStatus) || undefined,
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
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await usersApi.createUser(createForm);
      if (res.success) {
        setSuccessMsg(`User ${res.data?.name} created successfully.`);
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
      role: u.role,
      status: u.status,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await usersApi.updateUser(editingUser.id, editForm);
      if (res.success) {
        setSuccessMsg(`User ${res.data?.name} updated successfully.`);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setError(err);
    }
  };

  const handleToggleActivate = async (user: User) => {
    setError(null);
    setSuccessMsg(null);
    try {
      if (user.status === 'ACTIVE') {
        await usersApi.deactivateUser(user.id);
        setSuccessMsg(`User ${user.name} deactivated.`);
      } else {
        await usersApi.activateUser(user.id);
        setSuccessMsg(`User ${user.name} activated.`);
      }
      fetchUsers();
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>User Management</h2>
          <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.88rem' }}>
            List, filter, create, edit, activate, and deactivate users across all roles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers} disabled={loading}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            + Create New User
          </button>
        </div>
      </div>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      {successMsg && (
        <div
          style={{
            backgroundColor: '#dafbe1',
            border: '1px solid #4ac26b',
            color: '#1a7f37',
            padding: '8px 12px',
            borderRadius: 4,
            marginBottom: 12,
            fontSize: '0.88rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            style={{ background: 'none', border: 'none', color: '#1a7f37', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 16 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, or registration number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ minWidth: 140 }}>
            <select
              className="form-control"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Roles</option>
              <option value="USER">USER (Patron)</option>
              <option value="LIBRARIAN">LIBRARIAN</option>
              <option value="ADMINISTRATOR">ADMINISTRATOR</option>
            </select>
          </div>

          <div style={{ minWidth: 140 }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>

          {(search || roleFilter || statusFilter) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setRoleFilter('');
                setStatusFilter('');
                setPage(1);
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Reg No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#57606a' }}>
                  No users found matching current filters.
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
                    <span
                      className={`badge ${
                        u.role === 'ADMINISTRATOR'
                          ? 'badge-admin'
                          : u.role === 'LIBRARIAN'
                          ? 'badge-librarian'
                          : 'badge-patron'
                      }`}
                    >
                      {u.role === 'USER' ? 'USER (Patron)' : u.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.status === 'ACTIVE' ? 'badge-success' : 'badge-inactive'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#57606a' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                        onClick={() => handleOpenEdit(u)}
                      >
                        Edit
                      </button>
                      <button
                        className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                        style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                        onClick={() => handleToggleActivate(u)}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
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
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Create New User (Admin)</h3>
            <p style={{ fontSize: '0.85rem', color: '#57606a' }}>
              Create an account with any role directly through the Admin API.
            </p>
            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>
                  Registration Number *
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={createForm.registrationNumber}
                  onChange={(e) => setCreateForm({ ...createForm, registrationNumber: e.target.value })}
                  placeholder="e.g. PAT-999 or LIB-999"
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Email *</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={createForm.phoneNumber}
                  onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Role *</label>
                <select
                  className="form-control"
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                >
                  <option value="USER">USER (Patron)</option>
                  <option value="LIBRARIAN">LIBRARIAN</option>
                  <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Initial Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Password123!"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Edit User: {editingUser.registrationNumber}</h3>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Role</label>
                <select
                  className="form-control"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                >
                  <option value="USER">USER (Patron)</option>
                  <option value="LIBRARIAN">LIBRARIAN</option>
                  <option value="ADMINISTRATOR">ADMINISTRATOR</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Status</label>
                <select
                  className="form-control"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as UserStatus })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
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

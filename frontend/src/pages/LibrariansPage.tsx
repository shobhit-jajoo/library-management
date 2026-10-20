import React, { useState } from 'react';
import { usersApi } from '../api/users.api';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { User } from '../types';

export const LibrariansPage: React.FC = () => {
  const [form, setForm] = useState({
    registrationNumber: '',
    name: '',
    email: '',
    phoneNumber: '',
    password: 'LibrarianPassword123!',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [createdUser, setCreatedUser] = useState<User | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedUser(null);
    try {
      const res = await usersApi.createLibrarian(form);
      if (res.success && res.data) {
        setCreatedUser(res.data);
        setForm({
          registrationNumber: '',
          name: '',
          email: '',
          phoneNumber: '',
          password: 'LibrarianPassword123!',
        });
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fillSampleData = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setForm({
      registrationNumber: `LIB-${randomSuffix}`,
      name: `Test Librarian ${randomSuffix}`,
      email: `librarian${randomSuffix}@library.local`,
      phoneNumber: '+1555000' + randomSuffix,
      password: 'LibrarianPassword123!',
    });
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Create Librarian Staff Account</h2>
        <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.88rem' }}>
          Dedicated Administrator endpoint (<code>POST /api/v1/admin/librarians</code>) to provision library staff.
        </p>
      </div>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      {createdUser && (
        <div
          style={{
            backgroundColor: '#dafbe1',
            border: '1px solid #4ac26b',
            borderRadius: 4,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <h4 style={{ margin: '0 0 6px 0', color: '#1a7f37' }}>✅ Librarian Created Successfully!</h4>
          <div style={{ fontSize: '0.85rem' }}>
            <div><strong>ID:</strong> {createdUser.id}</div>
            <div><strong>Registration:</strong> {createdUser.registrationNumber}</div>
            <div><strong>Name:</strong> {createdUser.name}</div>
            <div><strong>Email:</strong> {createdUser.email}</div>
            <div><strong>Role:</strong> <span className="badge badge-librarian">{createdUser.role}</span></div>
            <div><strong>Status:</strong> <span className="badge badge-success">{createdUser.status}</span></div>
          </div>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Registration Number *
            </label>
            <input
              type="text"
              className="form-control"
              required
              value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
              placeholder="e.g. LIB-101"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Full Name *
            </label>
            <input
              type="text"
              className="form-control"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Eleanor Vance"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Email Address *
            </label>
            <input
              type="email"
              className="form-control"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. eleanor@library.local"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Phone Number
            </label>
            <input
              type="tel"
              className="form-control"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="e.g. +1-555-1234"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
              Password *
            </label>
            <input
              type="password"
              className="form-control"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="LibrarianPassword123!"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={fillSampleData}>
              🪄 Fill Sample Values
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating Librarian...' : 'Create Librarian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

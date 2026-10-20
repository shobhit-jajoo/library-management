import React, { useState, useEffect } from 'react';
import { booksApi } from '../api/books.api';
import { Book, BookCopy, BookCopyStatus } from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { Pagination } from '../components/Pagination';

export const BooksPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modals
  const [showCreateBookModal, setShowCreateBookModal] = useState(false);
  const [createBookForm, setCreateBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    year: new Date().getFullYear(),
    genre: '',
  });

  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editBookForm, setEditBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    year: 0,
    genre: '',
  });

  // Copies Modal
  const [selectedBookForCopies, setSelectedBookForCopies] = useState<Book | null>(null);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [newCopyBarcode, setNewCopyBarcode] = useState('');
  const [newCopyCondition, setNewCopyCondition] = useState('GOOD');
  const [newCopyLocation, setNewCopyLocation] = useState('MAIN_SHELF');

  // Barcode Lookup Drawer / Tool
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [lookupCopy, setLookupCopy] = useState<BookCopy | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await booksApi.getBooks({
        page,
        limit,
        search: search.trim() || undefined,
        genre: genre.trim() || undefined,
        availableOnly: availableOnly || undefined,
      });
      if (res.success && res.data) {
        setBooks(res.data);
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
    fetchBooks();
  }, [page, availableOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await booksApi.createBook({
        ...createBookForm,
        year: Number(createBookForm.year) || undefined,
      });
      if (res.success) {
        setSuccessMsg(`Book "${res.data?.title}" created successfully.`);
        setShowCreateBookModal(false);
        setCreateBookForm({
          isbn: '',
          title: '',
          author: '',
          publisher: '',
          year: new Date().getFullYear(),
          genre: '',
        });
        fetchBooks();
      }
    } catch (err: any) {
      setError(err);
    }
  };

  const handleOpenEditBook = (book: Book) => {
    setEditingBook(book);
    setEditBookForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      year: book.year || new Date().getFullYear(),
      genre: book.genre || '',
    });
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    setError(null);
    try {
      const res = await booksApi.updateBook(editingBook.id, {
        ...editBookForm,
        year: Number(editBookForm.year) || undefined,
      });
      if (res.success) {
        setSuccessMsg(`Book "${res.data?.title}" updated successfully.`);
        setEditingBook(null);
        fetchBooks();
      }
    } catch (err: any) {
      setError(err);
    }
  };

  const handleDeleteBook = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete book "${title}"?`)) return;
    setError(null);
    try {
      await booksApi.deleteBook(id);
      setSuccessMsg(`Book "${title}" deleted.`);
      fetchBooks();
    } catch (err: any) {
      setError(err);
    }
  };

  // Copies Handlers
  const handleOpenCopies = async (book: Book) => {
    setSelectedBookForCopies(book);
    setNewCopyBarcode(`BC-${Date.now().toString().slice(-6)}`);
    fetchCopies(book.id);
  };

  const fetchCopies = async (bookId: string) => {
    setLoadingCopies(true);
    try {
      const res = await booksApi.getBookCopies(bookId);
      if (res.success && res.data) {
        setCopies(res.data);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForCopies) return;
    setError(null);
    try {
      await booksApi.createBookCopy(selectedBookForCopies.id, {
        barcode: newCopyBarcode,
        condition: newCopyCondition,
        location: newCopyLocation,
      });
      setNewCopyBarcode(`BC-${Date.now().toString().slice(-6)}`);
      fetchCopies(selectedBookForCopies.id);
      fetchBooks(); // refresh count
    } catch (err: any) {
      setError(err);
    }
  };

  const handleUpdateCopyStatus = async (copyId: string, status: BookCopyStatus) => {
    if (!selectedBookForCopies) return;
    setError(null);
    try {
      await booksApi.updateBookCopy(copyId, { status });
      fetchCopies(selectedBookForCopies.id);
      fetchBooks();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleDeleteCopy = async (copyId: string, barcode: string) => {
    if (!selectedBookForCopies) return;
    if (!window.confirm(`Delete copy ${barcode}?`)) return;
    setError(null);
    try {
      await booksApi.deleteBookCopy(copyId);
      fetchCopies(selectedBookForCopies.id);
      fetchBooks();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleLookupBarcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeSearch.trim()) return;
    setError(null);
    setLookupCopy(null);
    try {
      const res = await booksApi.getCopyByBarcode(barcodeSearch.trim());
      if (res.success && res.data) {
        setLookupCopy(res.data);
      }
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Books & Inventory Management</h2>
          <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.88rem' }}>
            Catalog CRUD, physical copies tracking, barcode search, and status transitions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchBooks} disabled={loading}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateBookModal(true)}>
            + Add New Book
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

      {/* Barcode Quick Lookup Widget */}
      <div className="card" style={{ marginBottom: 16, backgroundColor: '#f6f8fa' }}>
        <form onSubmit={handleLookupBarcode} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>🔍 Barcode Lookup:</span>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 220 }}
            placeholder="e.g. BC-001"
            value={barcodeSearch}
            onChange={(e) => setBarcodeSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            Lookup Copy
          </button>
          {lookupCopy && (
            <div style={{ marginLeft: 10, fontSize: '0.85rem' }}>
              Found: <strong>{lookupCopy.barcode}</strong> ({lookupCopy.status}) -{' '}
              <em>{lookupCopy.book?.title || 'Unknown Title'}</em> [Condition: {lookupCopy.condition}]
            </div>
          )}
        </form>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 16 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: 140 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Genre..."
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            Available Only
          </label>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
          {(search || genre || availableOnly) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setGenre('');
                setAvailableOnly(false);
                setPage(1);
              }}
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Books Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>ISBN</th>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>Year</th>
              <th>Copies (Avail/Total)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && books.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                  Loading catalog...
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#57606a' }}>
                  No books found.
                </td>
              </tr>
            ) : (
              books.map((b) => (
                <tr key={b.id}>
                  <td><code>{b.isbn}</code></td>
                  <td><strong>{b.title}</strong></td>
                  <td>{b.author}</td>
                  <td>{b.genre || '-'}</td>
                  <td>{b.year || '-'}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color: b.availableCopies > 0 ? '#1a7f37' : '#cf222e',
                      }}
                    >
                      {b.availableCopies}
                    </span>{' '}
                    / {b.totalCopies}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                        onClick={() => handleOpenCopies(b)}
                      >
                        Copies ({b.totalCopies})
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                        onClick={() => handleOpenEditBook(b)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                        onClick={() => handleDeleteBook(b.id, b.title)}
                      >
                        Delete
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

      {/* Create Book Modal */}
      {showCreateBookModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Add New Book to Catalog</h3>
            <form onSubmit={handleCreateBook}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>ISBN *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={createBookForm.isbn}
                  onChange={(e) => setCreateBookForm({ ...createBookForm, isbn: e.target.value })}
                  placeholder="e.g. 978-0-13-468599-1"
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Title *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={createBookForm.title}
                  onChange={(e) => setCreateBookForm({ ...createBookForm, title: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Author *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={createBookForm.author}
                  onChange={(e) => setCreateBookForm({ ...createBookForm, author: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Publisher</label>
                <input
                  type="text"
                  className="form-control"
                  value={createBookForm.publisher}
                  onChange={(e) => setCreateBookForm({ ...createBookForm, publisher: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={createBookForm.year}
                    onChange={(e) => setCreateBookForm({ ...createBookForm, year: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Genre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={createBookForm.genre}
                    onChange={(e) => setCreateBookForm({ ...createBookForm, genre: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateBookModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {editingBook && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Edit Book: {editingBook.title}</h3>
            <form onSubmit={handleUpdateBook}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>ISBN</label>
                <input
                  type="text"
                  className="form-control"
                  value={editBookForm.isbn}
                  onChange={(e) => setEditBookForm({ ...editBookForm, isbn: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={editBookForm.title}
                  onChange={(e) => setEditBookForm({ ...editBookForm, title: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Author</label>
                <input
                  type="text"
                  className="form-control"
                  value={editBookForm.author}
                  onChange={(e) => setEditBookForm({ ...editBookForm, author: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Publisher</label>
                <input
                  type="text"
                  className="form-control"
                  value={editBookForm.publisher}
                  onChange={(e) => setEditBookForm({ ...editBookForm, publisher: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editBookForm.year}
                    onChange={(e) => setEditBookForm({ ...editBookForm, year: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Genre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editBookForm.genre}
                    onChange={(e) => setEditBookForm({ ...editBookForm, genre: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingBook(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Copies Modal */}
      {selectedBookForCopies && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 750 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Manage Copies: {selectedBookForCopies.title}</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedBookForCopies(null)}
              >
                Close
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#57606a', marginTop: 4 }}>
              ISBN: <code>{selectedBookForCopies.isbn}</code>
            </p>

            {/* Add copy form */}
            <div className="card" style={{ padding: 10, backgroundColor: '#f6f8fa', marginBottom: 14 }}>
              <form onSubmit={handleAddCopy} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Barcode *"
                    required
                    value={newCopyBarcode}
                    onChange={(e) => setNewCopyBarcode(e.target.value)}
                  />
                </div>
                <div style={{ width: 130 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Condition"
                    value={newCopyCondition}
                    onChange={(e) => setNewCopyCondition(e.target.value)}
                  />
                </div>
                <div style={{ width: 140 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Location"
                    value={newCopyLocation}
                    onChange={(e) => setNewCopyLocation(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-sm">
                  + Add Copy
                </button>
              </form>
            </div>

            {/* Copies list */}
            {loadingCopies ? (
              <div>Loading copies...</div>
            ) : copies.length === 0 ? (
              <div style={{ color: '#57606a', textAlign: 'center', padding: 16 }}>
                No copies registered yet for this book.
              </div>
            ) : (
              <table className="table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Barcode</th>
                    <th>Status</th>
                    <th>Condition</th>
                    <th>Location</th>
                    <th>Status Change</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {copies.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.barcode}</strong></td>
                      <td>
                        <span
                          className={`badge ${
                            c.status === 'AVAILABLE'
                              ? 'badge-success'
                              : c.status === 'ISSUED'
                              ? 'badge-patron'
                              : c.status === 'RESERVED'
                              ? 'badge-librarian'
                              : 'badge-inactive'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td>{c.condition}</td>
                      <td>{c.location || '-'}</td>
                      <td>
                        <select
                          className="form-control"
                          style={{ padding: '2px 4px', fontSize: '0.75rem', width: 'auto' }}
                          value={c.status}
                          onChange={(e) => handleUpdateCopyStatus(c.id, e.target.value as BookCopyStatus)}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                          <option value="LOST">LOST</option>
                          <option value="ISSUED">ISSUED</option>
                          <option value="RESERVED">RESERVED</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                          onClick={() => handleDeleteCopy(c.id, c.barcode)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

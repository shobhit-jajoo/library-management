import React, { useState, useEffect } from 'react';
import { booksApi } from '../api/books.api';
import { Book, BookCopy, BookCopyStatus } from '../types';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { Pagination } from '../components/Pagination';

export const BooksInventoryPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Add / Edit Book Modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    year: new Date().getFullYear(),
    genre: '',
  });

  // Physical Copies Modal
  const [selectedBookForCopies, setSelectedBookForCopies] = useState<Book | null>(null);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [newBarcode, setNewBarcode] = useState('');
  const [newCondition, setNewCondition] = useState('GOOD');
  const [newLocation, setNewLocation] = useState('MAIN_SHELF');

  // Barcode Lookup Tool
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

  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookForm({
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      year: new Date().getFullYear(),
      genre: '',
    });
    setShowBookModal(true);
  };

  const handleOpenEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm({
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      year: book.year || new Date().getFullYear(),
      genre: book.genre || '',
    });
    setShowBookModal(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingBook) {
        await booksApi.updateBook(editingBook.id, {
          ...bookForm,
          year: Number(bookForm.year) || undefined,
        });
        setSuccessMsg(`Book "${bookForm.title}" updated successfully.`);
      } else {
        await booksApi.createBook({
          ...bookForm,
          year: Number(bookForm.year) || undefined,
        });
        setSuccessMsg(`Book "${bookForm.title}" added to catalog.`);
      }
      setShowBookModal(false);
      fetchBooks();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleDeleteBook = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? All associated copies must be removed first.`)) {
      return;
    }
    setError(null);
    try {
      await booksApi.deleteBook(id);
      setSuccessMsg(`Book "${title}" deleted.`);
      fetchBooks();
    } catch (err: any) {
      setError(err);
    }
  };

  // Copies
  const handleOpenCopies = async (book: Book) => {
    setSelectedBookForCopies(book);
    setNewBarcode(`BC-${Date.now().toString().slice(-6)}`);
    fetchCopies(book.id);
  };

  const fetchCopies = async (bookId: string) => {
    setLoadingCopies(true);
    try {
      const res = await booksApi.getBookCopies(bookId);
      setCopies(res.data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForCopies || !newBarcode.trim()) return;
    setError(null);
    try {
      await booksApi.createBookCopy(selectedBookForCopies.id, {
        barcode: newBarcode.trim(),
        condition: newCondition,
        location: newLocation,
      });
      setNewBarcode(`BC-${Date.now().toString().slice(-6)}`);
      fetchCopies(selectedBookForCopies.id);
      fetchBooks();
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
    if (!window.confirm(`Delete physical copy ${barcode}?`)) return;
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
      setLookupCopy(res.data || null);
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📚 Books & Inventory Management</h2>
          <p>Add, edit, remove titles, track physical copies, barcodes, conditions, and availability</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchBooks} disabled={loading}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAddBook}>
            + Add New Title
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

      {/* Barcode Quick Inspector */}
      <div className="card" style={{ marginBottom: 16, backgroundColor: '#f8fafc' }}>
        <form onSubmit={handleLookupBarcode} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <strong style={{ fontSize: '0.85rem' }}>🔍 Instant Barcode Scan:</strong>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 220 }}
            placeholder="Scan barcode (e.g. BC-001)..."
            value={barcodeSearch}
            onChange={(e) => setBarcodeSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            Lookup
          </button>
          {lookupCopy && (
            <div style={{ fontSize: '0.85rem', color: '#0f172a' }}>
              Found: <strong>{lookupCopy.barcode}</strong> ({lookupCopy.status}) &bull;{' '}
              <em>{lookupCopy.book?.title}</em> [{lookupCopy.condition}]
            </div>
          )}
        </form>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: 16, padding: '10px 14px' }}>
        <form onSubmit={handleSearchSubmit} className="filter-form">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />

          <input
            type="text"
            className="form-control"
            placeholder="Genre..."
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            style={{ width: 140 }}
          />

          <label className="checkbox-label">
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
      <div className="card table-card">
        <table className="table">
          <thead>
            <tr>
              <th>ISBN</th>
              <th>Title</th>
              <th>Author</th>
              <th>Genre</th>
              <th>Year</th>
              <th>Copies (Avail/Total)</th>
              <th>Desk Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && books.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                  Loading book catalog...
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                  No books found matching criteria.
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
                        color: b.availableCopies > 0 ? '#16a34a' : '#ef4444',
                      }}
                    >
                      {b.availableCopies}
                    </span>{' '}
                    / {b.totalCopies}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenCopies(b)}
                      >
                        Copies ({b.totalCopies})
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEditBook(b)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
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

      {/* Add / Edit Book Modal */}
      {showBookModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>{editingBook ? 'Edit Book Record' : 'Add New Book to Catalog'}</h3>
            <form onSubmit={handleSaveBook}>
              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  placeholder="e.g. 978-0-13-468599-1"
                />
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Publisher</label>
                <input
                  type="text"
                  className="form-control"
                  value={bookForm.publisher}
                  onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                />
              </div>

              <div className="grid-2col" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label>Publication Year</label>
                  <input
                    type="number"
                    className="form-control"
                    value={bookForm.year}
                    onChange={(e) => setBookForm({ ...bookForm, year: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={bookForm.genre}
                    onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBookModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copies Modal */}
      {selectedBookForCopies && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 740 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Physical Copies: {selectedBookForCopies.title}</h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedBookForCopies(null)}
              >
                Close
              </button>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
              ISBN: <code>{selectedBookForCopies.isbn}</code>
            </p>

            {/* Register new copy */}
            <div className="card" style={{ backgroundColor: '#f8fafc', padding: 12, marginBottom: 14 }}>
              <form onSubmit={handleAddCopy} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Barcode *"
                  required
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Condition"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  style={{ width: 130 }}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Shelf Location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  style={{ width: 140 }}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  + Add Copy
                </button>
              </form>
            </div>

            {/* Copies list */}
            {loadingCopies ? (
              <div style={{ padding: 16 }}>Loading copies...</div>
            ) : copies.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
                No physical copies registered for this title yet.
              </div>
            ) : (
              <table className="table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Barcode</th>
                    <th>Status</th>
                    <th>Condition</th>
                    <th>Location</th>
                    <th>Change Status</th>
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
                              : c.status === 'BORROWED'
                              ? 'badge-primary'
                              : c.status === 'RESERVED'
                              ? 'badge-warning'
                              : 'badge-secondary'
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
                          style={{ padding: '2px 6px', fontSize: '0.75rem', width: 'auto' }}
                          value={c.status}
                          onChange={(e) => handleUpdateCopyStatus(c.id, e.target.value as BookCopyStatus)}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                          <option value="LOST">LOST</option>
                          <option value="BORROWED">BORROWED</option>
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

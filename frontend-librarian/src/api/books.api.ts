import { apiClient } from './client';
import { ApiResponse, Book, BookCopy, BookCopyStatus } from '../types';

export interface GetBooksParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  availableOnly?: boolean;
}

export const booksApi = {
  async getBooks(params?: GetBooksParams): Promise<ApiResponse<Book[]>> {
    const res = await apiClient.get<ApiResponse<Book[]>>('/books', { params });
    return res.data;
  },

  async getBookById(id: string): Promise<ApiResponse<Book>> {
    const res = await apiClient.get<ApiResponse<Book>>(`/books/${id}`);
    return res.data;
  },

  async createBook(data: {
    isbn: string;
    title: string;
    author: string;
    publisher?: string;
    year?: number;
    genre?: string;
  }): Promise<ApiResponse<Book>> {
    const res = await apiClient.post<ApiResponse<Book>>('/books', data);
    return res.data;
  },

  async updateBook(
    id: string,
    data: Partial<{
      isbn: string;
      title: string;
      author: string;
      publisher: string;
      year: number;
      genre: string;
    }>
  ): Promise<ApiResponse<Book>> {
    const res = await apiClient.patch<ApiResponse<Book>>(`/books/${id}`, data);
    return res.data;
  },

  async deleteBook(id: string): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(`/books/${id}`);
    return res.data;
  },

  // Physical copies
  async getBookCopies(bookId: string): Promise<ApiResponse<BookCopy[]>> {
    const res = await apiClient.get<ApiResponse<BookCopy[]>>(`/books/${bookId}/copies`);
    return res.data;
  },

  async createBookCopy(
    bookId: string,
    data: {
      barcode: string;
      condition?: string;
      location?: string;
    }
  ): Promise<ApiResponse<BookCopy>> {
    const res = await apiClient.post<ApiResponse<BookCopy>>(`/books/${bookId}/copies`, data);
    return res.data;
  },

  async getCopyByBarcode(barcode: string): Promise<ApiResponse<BookCopy>> {
    const res = await apiClient.get<ApiResponse<BookCopy>>(`/book-copies/barcode/${barcode}`);
    return res.data;
  },

  async updateBookCopy(
    id: string,
    data: {
      status?: BookCopyStatus;
      condition?: string;
      location?: string;
    }
  ): Promise<ApiResponse<BookCopy>> {
    const res = await apiClient.patch<ApiResponse<BookCopy>>(`/book-copies/${id}`, data);
    return res.data;
  },

  async deleteBookCopy(id: string): Promise<ApiResponse<null>> {
    const res = await apiClient.delete<ApiResponse<null>>(`/book-copies/${id}`);
    return res.data;
  },
};

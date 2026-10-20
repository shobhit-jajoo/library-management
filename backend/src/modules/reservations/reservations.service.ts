import { prisma } from '../../config/database.js';
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  BusinessRuleError,
} from '../../utils/errors.js';
import { AuditService } from '../audit/audit.service.js';
import { NotificationService } from '../notifications/notifications.service.js';
import { PoliciesService } from '../policies/policies.service.js';
import { CreateReservationInput } from './reservations.schema.js';
import { PaginationMeta, ReservationStatus, Role } from '../../types/index.js';
import { Prisma } from '@prisma/client';

export class ReservationsService {
  public static async createReservation(
    userId: string,
    input: CreateReservationInput,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenError('Inactive accounts cannot make reservations', 'ACCOUNT_INACTIVE');
    }

    const policy = await PoliciesService.getPolicy();

    // Check if user already has an active reservation for this book/copy
    let targetCopyId = input.copyId;
    let targetBookTitle = 'Book';

    if (input.copyId) {
      const copy = await prisma.bookCopy.findUnique({
        where: { id: input.copyId },
        include: { book: true },
      });
      if (!copy) {
        throw new NotFoundError('Book copy not found');
      }
      if (copy.status !== 'AVAILABLE') {
        throw new ConflictError(
          `Book copy is currently ${copy.status.toLowerCase()} and cannot be reserved`,
          'BOOK_COPY_UNAVAILABLE',
        );
      }
      targetCopyId = copy.id;
      targetBookTitle = copy.book.title;
    } else if (input.bookId) {
      const book = await prisma.book.findUnique({
        where: { id: input.bookId },
        include: {
          copies: {
            where: { status: 'AVAILABLE' },
            take: 1,
          },
        },
      });

      if (!book) {
        throw new NotFoundError('Book not found');
      }
      if (!book.copies.length) {
        throw new ConflictError(
          'There are currently no available copies of this book to reserve.',
          'NO_COPIES_AVAILABLE',
        );
      }
      targetCopyId = book.copies[0].id;
      targetBookTitle = book.title;
    }

    if (!targetCopyId) {
      throw new BusinessRuleError('Could not determine a book copy to reserve.');
    }

    // Check if user already has an active reservation on this copy
    const existingUserRes = await prisma.reservation.findFirst({
      where: { userId, copyId: targetCopyId, status: 'ACTIVE' },
    });
    if (existingUserRes) {
      throw new ConflictError(
        'You already have an active reservation for this book copy.',
        'RESERVATION_ALREADY_EXISTS',
      );
    }

    const expiryDate = new Date(Date.now() + policy.reservationPeriod * 24 * 60 * 60 * 1000);

    // Concurrency protected transaction: atomically flip copy to RESERVED only if AVAILABLE
    const reservation = await prisma.$transaction(async (tx) => {
      const updatedCopy = await tx.bookCopy.updateMany({
        where: { id: targetCopyId, status: 'AVAILABLE' },
        data: { status: 'RESERVED' },
      });

      if (updatedCopy.count === 0) {
        throw new ConflictError(
          'The selected book copy is no longer available.',
          'BOOK_COPY_UNAVAILABLE',
        );
      }

      const resRecord = await tx.reservation.create({
        data: {
          userId,
          copyId: targetCopyId,
          reservationDate: new Date(),
          expiryDate,
          status: 'ACTIVE',
        },
        include: {
          copy: {
            include: { book: true },
          },
        },
      });

      return resRecord;
    });

    // Notify user
    await NotificationService.createNotification({
      userId,
      message: `Your reservation for "${targetBookTitle}" is confirmed. Please collect it before ${expiryDate.toLocaleDateString()}.`,
      type: 'RESERVATION_CONFIRMED',
    });

    await AuditService.log({
      userId,
      action: 'RESERVATION_CREATED',
      entityType: 'RESERVATION',
      entityId: reservation.id,
      details: { copyId: targetCopyId, expiryDate },
      ipAddress,
      userAgent,
    });

    return reservation;
  }

  public static async getReservations(
    currentUserId: string,
    role: Role,
    query: { page?: number; limit?: number; status?: ReservationStatus; userId?: string },
  ): Promise<{ reservations: unknown[]; pagination: PaginationMeta }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ReservationWhereInput = {};

    // Normal USER can only see own reservations
    if (role === 'USER') {
      where.userId = currentUserId;
    } else if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [total, reservations] = await Promise.all([
      prisma.reservation.count({ where }),
      prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { reservationDate: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, registrationNumber: true },
          },
          copy: {
            include: {
              book: {
                select: { id: true, title: true, author: true, isbn: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      reservations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getReservationById(id: string, currentUserId: string, role: Role) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, registrationNumber: true },
        },
        copy: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    if (role === 'USER' && reservation.userId !== currentUserId) {
      throw new ForbiddenError('Cannot access another user\'s reservation details');
    }

    return reservation;
  }

  public static async cancelReservation(
    id: string,
    currentUserId: string,
    role: Role,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { copy: true },
    });

    if (!reservation) {
      throw new NotFoundError('Reservation not found');
    }

    if (role === 'USER' && reservation.userId !== currentUserId) {
      throw new ForbiddenError('You can only cancel your own reservations', 'UNAUTHORIZED_CANCELLATION');
    }

    if (reservation.status !== 'ACTIVE') {
      throw new BusinessRuleError(
        `Cannot cancel reservation with status '${reservation.status}'`,
        'RESERVATION_NOT_ACTIVE',
      );
    }

    // Transaction to update reservation and free up copy
    const cancelled = await prisma.$transaction(async (tx) => {
      const updatedRes = await tx.reservation.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // Release copy back to AVAILABLE if it is currently marked RESERVED
      await tx.bookCopy.updateMany({
        where: { id: reservation.copyId, status: 'RESERVED' },
        data: { status: 'AVAILABLE' },
      });

      return updatedRes;
    });

    await AuditService.log({
      userId: currentUserId,
      action: 'RESERVATION_CANCELLED',
      entityType: 'RESERVATION',
      entityId: id,
      details: { copyId: reservation.copyId, cancelledByRole: role },
      ipAddress,
      userAgent,
    });

    return cancelled;
  }

  public static async processExpiredReservations(): Promise<{ expiredCount: number }> {
    const now = new Date();
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: 'ACTIVE',
        expiryDate: { lt: now },
      },
      include: {
        copy: { include: { book: true } },
      },
    });

    if (!expiredReservations.length) {
      return { expiredCount: 0 };
    }

    let count = 0;
    for (const res of expiredReservations) {
      await prisma.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id: res.id },
          data: { status: 'EXPIRED' },
        });

        // Release copy if still RESERVED
        await tx.bookCopy.updateMany({
          where: { id: res.copyId, status: 'RESERVED' },
          data: { status: 'AVAILABLE' },
        });
      });

      await NotificationService.createNotification({
        userId: res.userId,
        message: `Your reservation for "${res.copy.book.title}" has expired and the copy has been released.`,
        type: 'GENERAL',
      });

      await AuditService.log({
        action: 'RESERVATION_EXPIRED',
        entityType: 'RESERVATION',
        entityId: res.id,
        details: { copyId: res.copyId, userId: res.userId },
      });

      count++;
    }

    return { expiredCount: count };
  }
}

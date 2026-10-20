import { z } from 'zod';

export const CreateReservationSchema = z
  .object({
    bookId: z.string().uuid('Valid book ID required').optional(),
    copyId: z.string().uuid('Valid copy ID required').optional(),
  })
  .refine((data) => data.bookId || data.copyId, {
    message: 'Either bookId or copyId must be provided',
  });

export type CreateReservationInput = z.infer<typeof CreateReservationSchema>;

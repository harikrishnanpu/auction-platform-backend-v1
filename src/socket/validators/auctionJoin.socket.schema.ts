import { z } from 'zod';

export const auctionJoinSocketSchema = z.object({
  auctionId: z.string().trim().min(1, 'auctionId is required'),
  mode: z.enum(['SELLER', 'USER', 'ADMIN'], {
    message: 'mode must be SELLER, USER, or ADMIN',
  }),
});

export type AuctionJoinSocketPayload = z.infer<typeof auctionJoinSocketSchema>;

import z from 'zod';

export const browseAuctionSchema = z.object({
  category: z.string().optional(),
  auctionType: z.enum(['LONG', 'LIVE', 'SEALED']).optional(),
});

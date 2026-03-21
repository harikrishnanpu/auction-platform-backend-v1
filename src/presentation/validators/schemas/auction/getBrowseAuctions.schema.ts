import { z } from 'zod';

const auctionTypeEnum = z.enum(['LONG', 'LIVE', 'SEALED', 'ALL']);

export const getBrowseAuctionsSchema = z.object({
  auctionType: auctionTypeEnum.optional().default('ALL'),
  categoryId: z.string().optional().default('ALL'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: z
    .enum(['startAt', 'endAt', 'startPrice', 'createdAt'])
    .optional()
    .default('startAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional().default(''),
});

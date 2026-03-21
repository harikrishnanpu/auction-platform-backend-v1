import { z } from 'zod';

export const getLatestAuctionsSchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(20, 'Limit must be at most 20')
    .optional()
    .default(5),
});

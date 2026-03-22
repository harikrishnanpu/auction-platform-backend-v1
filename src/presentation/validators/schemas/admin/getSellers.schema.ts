import z from 'zod';

export const getAllSellersSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  pendingOnly: z.boolean().optional(),
});

export type ZodGetAllSellersInputType = z.infer<typeof getAllSellersSchema>;

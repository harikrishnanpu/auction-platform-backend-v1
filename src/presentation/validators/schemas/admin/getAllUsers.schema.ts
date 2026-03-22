import z from 'zod';

export const getAllUsersSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  authProvider: z.string().optional(),
});

export type ZodGetAllUsersInputType = z.infer<typeof getAllUsersSchema>;

import z from 'zod';

export const blockUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required').trim(),
  block: z.boolean(),
});

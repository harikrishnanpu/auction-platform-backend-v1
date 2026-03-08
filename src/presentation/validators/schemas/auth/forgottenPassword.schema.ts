import z from 'zod';

export const forgottenPasswordSchema = z.object({
  email: z.string().email().trim().min(1, 'Email is required'),
});

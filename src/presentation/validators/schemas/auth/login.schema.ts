import z from 'zod';

export const loginSchema = z.object({
  email: z.string().email().trim().min(1, 'Email is required'),
  password: z
    .string()
    .trim()
    .min(6, 'Password is required')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
});

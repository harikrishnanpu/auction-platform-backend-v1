import z from 'zod';

export const changeProfilePasswordSchema = z.object({
  otp: z.string().min(6).trim(),
  oldPassword: z
    .string()
    .trim()
    .min(6, 'Password is required and must be at least 6 characters long'),
  newPassword: z
    .string()
    .trim()
    .min(6, 'Password is required and must be at least 6 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
});

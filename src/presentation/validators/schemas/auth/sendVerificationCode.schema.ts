import z from 'zod';

export const sendVerificationCodeSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email')
    .max(50, 'Email cannot exceed 50 characters'),
});

export type SendVerificationCodeInput = z.infer<
  typeof sendVerificationCodeSchema
>;

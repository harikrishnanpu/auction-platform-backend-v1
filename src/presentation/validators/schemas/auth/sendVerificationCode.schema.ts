import z from 'zod';

export const sendVerificationCodeSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email')
    .max(30, 'Email cannot exceed 30 characters'),
});

export type SendVerificationCodeInput = z.infer<
  typeof sendVerificationCodeSchema
>;

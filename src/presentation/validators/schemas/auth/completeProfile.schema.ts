import z from 'zod';

export const completeProfileSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .min(1, 'Phone is required'),
  address: z.string().trim().min(10, 'Address is required'),
});

import z from 'zod';

export const editProfileSchema = z.object({
  otp: z.string().min(6, 'Otp must be at least 6 characters long').trim(),
  name: z.string().min(3, 'Name must be at least 3 characters long').trim(),
  phone: z.string().min(10, 'Phone must be at least 10 characters long').trim(),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters long')
    .trim(),
});

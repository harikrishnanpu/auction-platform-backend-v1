import z from 'zod';

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(30, 'First name cannot exceed 30 characters')
    .regex(
      /^[a-zA-Z]+$/,
      'First name cannot contain numbers or special characters',
    ),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(30, 'Last name cannot exceed 30 characters')
    .regex(
      /^[a-zA-Z]+$/,
      'Last name cannot contain numbers or special characters',
    ),
  email: z
    .string()
    .trim()
    .email('Invalid email')
    .max(30, 'Email cannot exceed 30 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(/^[0-9]{10}$/, 'Invalid phone number')
    .max(10, 'Phone number cannot exceed 10 characters'),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(100, 'Address cannot exceed 100 characters'),
  password: z
    .string()
    .trim()
    .min(6, 'Password is required')
    .max(10, 'Password cannot s exceed 10 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    ),
});

export type ZodRegisterInputType = z.infer<typeof registerSchema>;

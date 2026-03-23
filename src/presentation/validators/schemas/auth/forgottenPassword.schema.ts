import z from 'zod';

export const forgottenPasswordSchema = z.object({
  email: z.email('Email is required'),
});

export type ZodForgottenPasswordInputType = z.infer<
  typeof forgottenPasswordSchema
>;

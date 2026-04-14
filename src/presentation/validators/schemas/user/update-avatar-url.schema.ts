import z from 'zod';

export const updateAvatarUrlSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    fileKey: z.string().min(1, 'Avatar Key is required').trim(),
});

export type ZodUpdateAvatarUrlInputType = z.infer<typeof updateAvatarUrlSchema>;

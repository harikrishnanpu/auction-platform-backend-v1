import z from 'zod';

export const updateAvatarUrlSchema = z.object({
  fileKey: z.string().min(1, 'Avatar Key is required').trim(),
});

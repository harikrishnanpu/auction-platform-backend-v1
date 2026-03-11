import z from 'zod';

export const generateUploadUrlSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  fileName: z.string().min(1, 'File name is required').trim(),
  fileSize: z.number().min(1, 'File size is required'),
});

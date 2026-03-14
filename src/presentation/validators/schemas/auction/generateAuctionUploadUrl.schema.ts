import { z } from 'zod';

export const generateAuctionUploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required').trim(),
  contentType: z.string().min(1, 'Content type is required').trim(),
  fileSize: z.number().min(1, 'File size is required'),
});

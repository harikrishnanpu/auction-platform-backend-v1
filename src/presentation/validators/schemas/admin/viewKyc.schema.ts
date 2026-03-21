import z from 'zod';

export const viewKycSchema = z.object({
  documentId: z.string().trim().min(1, 'Document ID is required'),
});

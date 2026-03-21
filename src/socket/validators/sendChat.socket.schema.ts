import { z } from 'zod';

const maxMessageLength = 2000;

export const sendChatSocketSchema = z.object({
  auctionId: z.string().trim().min(1, 'auctionId is required'),
  message: z
    .string()
    .trim()
    .min(1, 'message cannot be empty')
    .max(
      maxMessageLength,
      `message must be at most ${maxMessageLength} characters`,
    ),
});

export type SendChatSocketPayload = z.infer<typeof sendChatSocketSchema>;

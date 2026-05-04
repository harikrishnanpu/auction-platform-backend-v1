import { z } from 'zod';

export const askAgentSocketSchema = z.object({
    auctionId: z.uuid().optional(),
    message: z.string().min(1).max(4000),
    lastMessages: z
        .array(
            z.object({
                role: z.enum(['user', 'assistant']),
                content: z.string().min(1).max(4000),
            }),
        )
        .max(20)
        .optional(),
});

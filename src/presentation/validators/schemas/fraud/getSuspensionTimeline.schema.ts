import z from 'zod';

export const getSuspensionTimelineSchema = z.object({
    userId: z.string().trim().min(1),
});

export type ZodGetSuspensionTimelineInputType = z.infer<
    typeof getSuspensionTimelineSchema
>;

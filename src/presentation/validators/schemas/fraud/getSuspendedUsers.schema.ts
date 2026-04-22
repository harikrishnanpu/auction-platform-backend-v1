import z from 'zod';

export const getSuspendedUsersSchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
    search: z.string().optional().default(''),
});

export type ZodGetSuspendedUsersInputType = z.infer<
    typeof getSuspendedUsersSchema
>;

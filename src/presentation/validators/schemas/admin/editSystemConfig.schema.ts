import z from 'zod';
import { SystemConfigKey } from '@domain/entities/system-config/system-config.entity';

export const editSystemConfigSchema = z.object({
    key: z.enum(SystemConfigKey, {
        error: 'Invalid system config key',
    }),
    description: z.string().trim().max(300),
    value: z.string().trim().min(1, 'Value is required'),
});

export type ZodEditSystemConfigInputType = z.infer<
    typeof editSystemConfigSchema
>;

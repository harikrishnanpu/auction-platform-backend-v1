import z from 'zod';
import { SYSTEM_CONFIG_KEY_ENUM } from '../../../../domain/constants/systemConfig.constants';

export const createSystemConfigSchema = z.object({
    key: z.enum(SYSTEM_CONFIG_KEY_ENUM, {
        error: 'Invalid system config key',
    }),
    description: z.string().trim().max(300).nullable().optional(),
    value: z.string().trim().min(1, 'Value is required'),
});

export type ZodCreateSystemConfigInputType = z.infer<
    typeof createSystemConfigSchema
>;

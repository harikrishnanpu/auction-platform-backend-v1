import z from 'zod';
import { SystemConfigKey } from '../../../../domain/constants/systemConfig.constants';

export const createSystemConfigSchema = z.object({
    key: z.enum(SystemConfigKey, {
        error: 'Invalid system config key',
    }),
    description: z.string().trim().max(300).nullable().optional(),
    value: z.string().trim().min(1, 'Value is required'),
});

export type ZodCreateSystemConfigInputType = z.infer<
    typeof createSystemConfigSchema
>;

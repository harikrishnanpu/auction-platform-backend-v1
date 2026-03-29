import { PaymentStatus } from '@domain/entities/payments/payments.entity';
import z from 'zod';

export const getUsersPaymentsSchema = z.object({
    status: z.enum(PaymentStatus).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
});

export type ZodGetUsersPaymentsInputType = z.infer<
    typeof getUsersPaymentsSchema
>;

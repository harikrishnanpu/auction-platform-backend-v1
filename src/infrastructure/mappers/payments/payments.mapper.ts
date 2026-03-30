import {
    PaymentFor,
    PaymentPhase,
    Payments,
    PaymentStatus,
} from '@domain/entities/payments/payments.entity';
import { Result } from '@domain/shared/result';
import { Payments as PrismaPayment } from '@prisma/client';

export class PaymentsMapper {
    static toDomain(raw: PrismaPayment): Result<Payments> {
        return Payments.create({
            id: raw.id,
            userId: raw.userId,
            amount: raw.amount,
            currency: raw.currency,
            status: raw.status as PaymentStatus,
            forPayment: raw.for as PaymentFor,
            referenceId: raw.referenceId,
            phase: raw.phase as PaymentPhase,
            dueAt: raw.dueAt,
            createdAt: raw.createdAt,
        });
    }
}

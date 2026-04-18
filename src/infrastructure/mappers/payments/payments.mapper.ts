import {
    PaymentFor,
    PaymentPhase,
    Payments,
    PaymentStatus,
} from '@domain/entities/payments/payments.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { Payments as PrismaPayment } from '@prisma/client';

export class PaymentsMapper implements IDbMapper<Payments, PrismaPayment> {
    toDomain(raw: PrismaPayment): Result<Payments> {
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

    toPersistence(payment: Payments): unknown {
        return {
            id: payment.getId(),
            userId: payment.getUserId(),
            amount: payment.getAmount(),
            currency: payment.getCurrency(),
            status: payment.getStatus(),
            for: payment.getForPayment(),
            referenceId: payment.getReferenceId(),
            phase: payment.getPhase(),
            dueAt: payment.getDueAt(),
        };
    }
}

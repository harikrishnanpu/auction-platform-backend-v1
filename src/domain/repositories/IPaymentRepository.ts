import {
    Payments,
    PaymentPhase,
    PaymentStatus,
} from '@domain/entities/payments/payments.entity';
import { Result } from '@domain/shared/result';

export interface IFindUserPaymentsOptions {
    status?: PaymentStatus;
    page?: number;
    limit?: number;
}

export interface IFindUserPaymentsResult {
    items: Payments[];
    total: number;
}

export interface IPaymentRepository {
    create(payment: Payments): Promise<Result<Payments>>;
    update(payment: Payments): Promise<Result<Payments>>;
    findById(id: string): Promise<Result<Payments | null>>;

    findByReferenceAndUserId(
        referenceId: string,
        userId: string,
    ): Promise<Result<Payments | null>>;

    findByReferenceUserAndPhase(
        referenceId: string,
        userId: string,
        phase: PaymentPhase,
    ): Promise<Result<Payments | null>>;

    findByUserId(
        userId: string,
        options?: IFindUserPaymentsOptions,
    ): Promise<Result<IFindUserPaymentsResult>>;
}

import {
    PaymentPhase,
    Payments,
    PaymentStatus,
} from '@domain/entities/payments/payments.entity';
import { Result } from '@domain/shared/result';

export interface IFindUserPayments {
    status: PaymentStatus | 'ALL';
    page: number;
    limit: number;
}

export interface IFindUserPaymentsResult {
    payments: Payments[];
    total: number;
}

export interface IFindSellerAuctionPaymentsOptions {
    status: PaymentStatus | 'ALL';
    page: number;
    limit: number;
}

export interface ISellerAuctionPaymentRow {
    payment: Payments;
    auctionTitle: string;
}

export interface IFindSellerAuctionPaymentsResult {
    items: ISellerAuctionPaymentRow[];
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
        options: IFindUserPayments,
    ): Promise<Result<IFindUserPaymentsResult>>;

    declineAllPendingForAuctionUser(
        auctionId: string,
        userId: string,
    ): Promise<Result<void>>;

    findBySellerAuctions(
        sellerId: string,
        options: IFindSellerAuctionPaymentsOptions,
    ): Promise<Result<IFindSellerAuctionPaymentsResult>>;
}

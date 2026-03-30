import {
    PaymentPhase,
    PaymentStatus,
} from '@domain/entities/payments/payments.entity';

export interface ICreatePendingPaymentForAuctionInputDto {
    userId: string | null;
    auctionId: string;
    winAmount: number;
    endedAt: Date;
}

export interface IUserPaymentDto {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    referenceId: string;
    phase: PaymentPhase;
    dueAt: Date;
    createdAt: Date;
}

export interface IGetUserPaymentsInputDto {
    userId: string;
    status: PaymentStatus | 'ALL';
    page: number;
    limit: number;
}

export interface IGetUserPaymentsOutputDto {
    items: IUserPaymentDto[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ICreatePaymentOrderInputDto {
    userId: string;
    paymentId: string;
}

export interface ICreatePaymentOrderOutputDto {
    paymentId: string;
    orderId: string;
    amountInPaise: number;
    currency: string;
    gatewayKey: string;
}

export interface IVerifyPaymentInputDto {
    userId: string;
    paymentId: string;
    orderId: string;
    gatewayPaymentId: string;
    signature: string;
}

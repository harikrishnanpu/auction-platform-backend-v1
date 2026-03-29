import {
    PaymentPhase,
    PaymentStatus,
} from '@domain/entities/payments/payments.entity';

export interface IGetSellerAuctionPaymentsInputDto {
    sellerId: string;
    status: PaymentStatus | 'ALL';
    page: number;
    limit: number;
}

export interface ISellerAuctionPaymentItemDto {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    phase: PaymentPhase;
    dueAt: Date;
    createdAt: Date;
    auctionId: string;
    auctionTitle: string;
    buyerUserId: string;
}

export interface IGetSellerAuctionPaymentsOutputDto {
    items: ISellerAuctionPaymentItemDto[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

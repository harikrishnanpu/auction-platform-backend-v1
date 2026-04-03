import { Result } from '@domain/shared/result';

export enum PublicAuctionFallbackParticipantsStatus {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING',
}

export enum PublicAuctionFallbackParticipantsPaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
}

export class PublicAuctionFallbackParticipants {
    constructor(
        private readonly id: string,
        private readonly publicFallbackAuctionId: string,
        private readonly userId: string,
        private readonly status: PublicAuctionFallbackParticipantsStatus,
        private paymentStatus: PublicAuctionFallbackParticipantsPaymentStatus,
        private readonly createdAt: Date,
    ) {}

    public static create({
        id,
        publicFallbackAuctionId,
        userId,
        status,
        paymentStatus,
        createdAt = new Date(),
    }: {
        id: string;
        publicFallbackAuctionId: string;
        userId: string;
        status: PublicAuctionFallbackParticipantsStatus;
        paymentStatus: PublicAuctionFallbackParticipantsPaymentStatus;
        createdAt?: Date;
    }): Result<PublicAuctionFallbackParticipants> {
        return Result.ok(
            new PublicAuctionFallbackParticipants(
                id,
                publicFallbackAuctionId,
                userId,
                status,
                paymentStatus,
                createdAt,
            ),
        );
    }

    public setPaymentStatus(
        paymentStatus: PublicAuctionFallbackParticipantsPaymentStatus,
    ): Result<void> {
        if (
            this.paymentStatus !==
            PublicAuctionFallbackParticipantsPaymentStatus.PENDING
        )
            return Result.fail('Payment status is not pending');

        this.paymentStatus = paymentStatus;

        return Result.ok();
    }

    public getId(): string {
        return this.id;
    }

    public getPublicFallbackAuctionId(): string {
        return this.publicFallbackAuctionId;
    }

    public getUserId(): string {
        return this.userId;
    }

    public getStatus(): PublicAuctionFallbackParticipantsStatus {
        return this.status;
    }

    public getPaymentStatus(): PublicAuctionFallbackParticipantsPaymentStatus {
        return this.paymentStatus;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}

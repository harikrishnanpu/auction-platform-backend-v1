import { Result } from '@domain/shared/result';

export enum AuctionPublicFallbackStatus {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING',
}

export enum AuctionPublicFallbackPaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
}

export class PublicFallbackAuction {
    constructor(
        private readonly id: string,
        private readonly auctionId: string,
        private readonly amount: number,
        private status: AuctionPublicFallbackStatus,
        private paymentStatus: AuctionPublicFallbackPaymentStatus,
        private readonly createdAt: Date,
    ) {}

    public static create({
        id,
        auctionId,
        amount,
        status,
        paymentStatus,
        createdAt = new Date(),
    }: {
        id: string;
        auctionId: string;
        amount: number;
        status: AuctionPublicFallbackStatus;
        paymentStatus: AuctionPublicFallbackPaymentStatus;
        createdAt?: Date;
    }): Result<PublicFallbackAuction> {
        return Result.ok(
            new PublicFallbackAuction(
                id,
                auctionId,
                amount,
                status,
                paymentStatus,
                createdAt,
            ),
        );
    }

    public setPaymentStatus(
        paymentStatus: AuctionPublicFallbackPaymentStatus,
    ): Result<void> {
        if (this.paymentStatus !== AuctionPublicFallbackPaymentStatus.PENDING)
            return Result.fail('Payment status is not pending');

        if (paymentStatus === AuctionPublicFallbackPaymentStatus.PAID) {
            this.status = AuctionPublicFallbackStatus.ACCEPTED;
        }

        this.paymentStatus = paymentStatus;

        return Result.ok();
    }

    public getId(): string {
        return this.id;
    }

    public getAuctionId(): string {
        return this.auctionId;
    }

    public getAmount(): number {
        return this.amount;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getStatus(): AuctionPublicFallbackStatus {
        return this.status;
    }

    public getPaymentStatus(): AuctionPublicFallbackPaymentStatus {
        return this.paymentStatus;
    }
}

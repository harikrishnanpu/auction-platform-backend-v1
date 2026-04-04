import { Result } from '@domain/shared/result';

export enum AuctionParticipantPaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
}

export class AuctionParticipant {
    constructor(
        private readonly id: string,
        private readonly auctionId: string,
        private readonly userId: string,
        private intialAmount: AuctionParticipantPaymentStatus,
        private readonly userName: string,
        private readonly joinedAt: Date,
    ) {}

    static create({
        id,
        auctionId,
        userId,
        userName,
        intialAmount,
        joinedAt = new Date(),
    }: {
        id: string;
        auctionId: string;
        userId: string;
        userName: string;
        intialAmount: AuctionParticipantPaymentStatus;
        joinedAt?: Date;
    }): Result<AuctionParticipant> {
        return Result.ok(
            new AuctionParticipant(
                id,
                auctionId,
                userId,
                intialAmount,
                userName,
                joinedAt,
            ),
        );
    }

    public setInitialAmount(
        status: AuctionParticipantPaymentStatus,
    ): Result<void> {
        this.intialAmount = status;
        return Result.ok();
    }

    getId(): string {
        return this.id;
    }

    getAuctionId(): string {
        return this.auctionId;
    }

    getUserId(): string {
        return this.userId;
    }

    getUserName(): string {
        return this.userName;
    }

    getJoinedAt(): Date {
        return this.joinedAt;
    }

    getIntialAmount(): AuctionParticipantPaymentStatus {
        return this.intialAmount;
    }
}

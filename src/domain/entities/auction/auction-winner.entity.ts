import { Result } from '@domain/shared/result';

export enum AuctionWinnerStatus {
    PENDING = 'PENDING',
    PARTIAL_PAYMENT_PENDING = 'PARTIAL_PAYMENT_PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

export class AuctionWinner {
    constructor(
        private readonly id: string,
        private readonly auctionId: string,
        private readonly userId: string,
        private readonly amount: number,
        private readonly rank: number,
        private readonly status: AuctionWinnerStatus,
        private readonly rejectionReason: string | null,
    ) {}

    static create({
        id,
        auctionId,
        userId,
        amount,
        rank,
        status,
        rejectionReason = null,
    }: {
        id: string;
        auctionId: string;
        userId: string;
        amount: number;
        rank: number;
        status: AuctionWinnerStatus;
        rejectionReason?: string | null;
    }): Result<AuctionWinner> {
        return Result.ok(
            new AuctionWinner(
                id,
                auctionId,
                userId,
                amount,
                rank,
                status,
                rejectionReason,
            ),
        );
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

    getAmount(): number {
        return this.amount;
    }

    getRank(): number {
        return this.rank;
    }

    getStatus(): AuctionWinnerStatus {
        return this.status;
    }

    getRejectionReason(): string | null {
        return this.rejectionReason;
    }
}

import { Result } from '@domain/shared/result';

export class Bid {
    constructor(
        private readonly id: string,
        private readonly auctionId: string,
        private readonly userId: string,
        private readonly createdAt: Date,
        private readonly amount: number | null,
        private readonly encryptedAmount: string | null,
    ) {}

    static create({
        id,
        auctionId,
        userId,
        amount = null,
        encryptedAmount = null,
        createdAt = new Date(),
    }: {
        id: string;
        auctionId: string;
        userId: string;
        amount?: number | null;
        encryptedAmount?: string | null;
        createdAt?: Date;
    }): Result<Bid> {
        if (amount && encryptedAmount) {
            return Result.fail(
                'Amount and encrypted amount cannot be provided together',
            );
        }

        return Result.ok(
            new Bid(id, auctionId, userId, createdAt, amount, encryptedAmount),
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

    getAmount(): number | null {
        return this.amount ?? 0;
    }

    getEncryptedAmount(): string | null {
        return this.encryptedAmount ?? null;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
}

import { Result } from '@domain/shared/result';

export type AutoBidStrategy = 'SLOW' | 'FASTER' | 'SNIPER';

export class AutoBidConfig {
    private constructor(
        private readonly id: string,
        private readonly userId: string,
        private readonly auctionId: string,
        private maxBidAmount: number,
        private strategy: AutoBidStrategy,
        private isActive: boolean,
        private readonly createdAt: Date,
        private updatedAt: Date,
    ) {}

    public static create(input: {
        id: string;
        userId: string;
        auctionId: string;
        maxBidAmount: number;
        strategy: AutoBidStrategy;
        isActive?: boolean;
        createdAt: Date;
        updatedAt: Date;
    }): Result<AutoBidConfig> {
        if (input.maxBidAmount <= 0) {
            return Result.fail('Max bid amount must be greater than zero');
        }
        return Result.ok(
            new AutoBidConfig(
                input.id,
                input.userId,
                input.auctionId,
                input.maxBidAmount,
                input.strategy,
                input.isActive ?? true,
                input.createdAt,
                input.updatedAt,
            ),
        );
    }

    public updateConfig(input: {
        strategy: AutoBidStrategy;
        maxBidAmount: number;
        isActive: boolean;
    }): Result<void> {
        this.strategy = input.strategy;
        this.maxBidAmount = input.maxBidAmount;
        this.isActive = input.isActive;
        this.updatedAt = new Date();
        return Result.ok();
    }

    public disable(): void {
        this.isActive = false;
        this.updatedAt = new Date();
    }

    public getId(): string {
        return this.id;
    }
    public getUserId(): string {
        return this.userId;
    }
    public getAuctionId(): string {
        return this.auctionId;
    }
    public getMaxBidAmount(): number {
        return this.maxBidAmount;
    }
    public getStrategy(): AutoBidStrategy {
        return this.strategy;
    }
    public getIsActive(): boolean {
        return this.isActive;
    }
    public getCreatedAt(): Date {
        return this.createdAt;
    }
    public getUpdatedAt(): Date {
        return this.updatedAt;
    }
}

import { Result } from '@domain/shared/result';
import { AuctionAsset } from './auction-asset.entity';
import {
    AuctionCategory,
    AuctionCategoryStatus,
} from './auction-category.entity';

export enum AuctionStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    ENDED = 'ENDED',
    SOLD = 'SOLD',
    CANCELLED = 'CANCELLED',
    FALLBACK_ENDED = 'FALLBACK_ENDED',
    FAILED = 'FAILED',
    FALLBACK_PUBLIC_NOTIFICATION = 'FALLBACK_PUBLIC_NOTIFICATION',
}

export enum AuctionType {
    LONG = 'LONG',
    LIVE = 'LIVE',
    SEALED = 'SEALED',
}

export class Auction {
    constructor(
        private readonly id: string,
        private readonly sellerId: string,
        private readonly auctionType: AuctionType,
        private readonly title: string,
        private readonly description: string,
        private readonly category: AuctionCategory,
        private readonly condition: string,
        private readonly startPrice: number,
        private readonly minIncrement: number,
        private readonly startAt: Date,
        private readonly endAt: Date,
        private status: AuctionStatus,
        private readonly antiSnipSeconds: number,
        private readonly extensionCount: number,
        private readonly maxExtensionCount: number,
        private readonly bidCooldownSeconds: number,
        private winnerId: string | null,
        private winAmount: number | null,
        private readonly assets: AuctionAsset[] = [],
    ) {}

    static create({
        id,
        sellerId,
        auctionType = AuctionType.LONG,
        title,
        description,
        category,
        condition,
        startPrice,
        minIncrement,
        startAt,
        endAt,
        status = AuctionStatus.DRAFT,
        antiSnipSeconds = 60,
        extensionCount = 0,
        maxExtensionCount = 3,
        bidCooldownSeconds = 10,
        winnerId = null,
        winAmount = null,
        assets = [],
    }: {
        id: string;
        sellerId: string;
        auctionType?: AuctionType;
        title: string;
        description: string;
        category: AuctionCategory;
        condition: string;
        startPrice: number;
        minIncrement: number;
        startAt: Date;
        endAt: Date;
        status?: AuctionStatus;
        antiSnipSeconds?: number;
        extensionCount?: number;
        maxExtensionCount?: number;
        bidCooldownSeconds?: number;
        winnerId?: string | null;
        winAmount?: number | null;
        assets?: AuctionAsset[];
    }): Result<Auction> {
        if (category.getStatus() !== AuctionCategoryStatus.APPROVED) {
            return Result.fail('Auction category is not approved');
        }

        if (startPrice < 500) {
            return Result.fail('Start price must be greater than 500');
        }

        if (maxExtensionCount > 10) {
            return Result.fail('Max extension count must be less than 10');
        }

        if (extensionCount > maxExtensionCount) {
            return Result.fail(
                'Extension count cannot exceed max extension count',
            );
        }

        if (auctionType === AuctionType.LONG && minIncrement < 1) {
            return Result.fail('Min increment must be greater than 1');
        }

        return Result.ok(
            new Auction(
                id,
                sellerId,
                auctionType,
                title,
                description,
                category,
                condition,
                startPrice,
                minIncrement,
                startAt,
                endAt,
                status,
                antiSnipSeconds,
                extensionCount,
                maxExtensionCount,
                bidCooldownSeconds,
                winnerId,
                winAmount,
                assets,
            ),
        );
    }

    setStatus(status: AuctionStatus): Result<void> {
        if (
            this.status === AuctionStatus.ENDED &&
            status !== AuctionStatus.FALLBACK_ENDED
        ) {
            return Result.fail('Auction is already ended');
        }

        if (
            this.status === AuctionStatus.FALLBACK_ENDED &&
            ![
                AuctionStatus.FAILED,
                AuctionStatus.FALLBACK_PUBLIC_NOTIFICATION,
            ].includes(status)
        ) {
            return Result.fail('Invalid status for fallback ended auction');
        }

        this.status = status;
        return Result.ok();
    }

    public setWinner(userId: string, winAmount: number): Result<void> {
        if (this.status === AuctionStatus.SOLD) {
            return Result.fail('Auction is already sold');
        }

        if (winAmount < this.startPrice) {
            return Result.fail('Win amount must be greater than start price');
        }

        this.winnerId = userId;
        this.winAmount = winAmount;
        return Result.ok();
    }

    getId(): string {
        return this.id;
    }

    getSellerId(): string {
        return this.sellerId;
    }

    getAuctionType(): AuctionType {
        return this.auctionType;
    }

    getTitle(): string {
        return this.title;
    }

    getDescription(): string {
        return this.description;
    }

    getCategoryId(): string {
        return this.category.getId();
    }

    getCondition(): string {
        return this.condition;
    }

    getStartPrice(): number {
        return this.startPrice;
    }

    getMinIncrement(): number {
        return this.minIncrement;
    }

    getStartAt(): Date {
        return this.startAt;
    }

    getEndAt(): Date {
        return this.endAt;
    }

    getStatus(): AuctionStatus {
        return this.status;
    }

    getAssets(): AuctionAsset[] {
        return this.assets;
    }

    getAntiSnipSeconds(): number {
        return this.antiSnipSeconds;
    }

    getExtensionCount(): number {
        return this.extensionCount;
    }

    getMaxExtensionCount(): number {
        return this.maxExtensionCount;
    }

    getBidCooldownSeconds(): number {
        return this.bidCooldownSeconds;
    }

    getWinnerId(): string | null {
        return this.winnerId;
    }

    getCategory(): AuctionCategory {
        return this.category;
    }

    getWinAmount(): number | null {
        return this.winAmount;
    }
}

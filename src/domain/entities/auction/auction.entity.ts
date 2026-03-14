import { Result } from '@domain/shared/result';
import { AuctionAsset } from './auction-asset.entity';

export enum AuctionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED',
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
    private readonly category: string,
    private readonly condition: string,
    private readonly startPrice: number,
    private readonly minIncrement: number,
    private readonly startAt: Date,
    private readonly endAt: Date,
    private readonly status: AuctionStatus,
    private readonly antiSnipSeconds: number,
    private readonly extensionCount: number,
    private readonly maxExtensionCount: number,
    private readonly bidCooldownSeconds: number,
    private readonly winnerId: string | null,
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
    assets = [],
  }: {
    id: string;
    sellerId: string;
    auctionType?: AuctionType;
    title: string;
    description: string;
    category: string;
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
    assets?: AuctionAsset[];
  }): Result<Auction> {
    if (startPrice < 0) {
      return Result.fail('Start price must be non-negative');
    }

    if (minIncrement < 0) {
      return Result.fail('Min increment must be non-negative');
    }

    if (endAt <= startAt) {
      return Result.fail('End time must be after start time');
    }

    if (antiSnipSeconds < 0) {
      return Result.fail('Anti-snip seconds must be non-negative');
    }

    if (extensionCount < 0) {
      return Result.fail('Extension count must be non-negative');
    }

    if (maxExtensionCount < 0) {
      return Result.fail('Max extension count must be non-negative');
    }

    if (bidCooldownSeconds < 0) {
      return Result.fail('Bid cooldown seconds must be non-negative');
    }

    if (extensionCount > maxExtensionCount) {
      return Result.fail('Extension count cannot exceed max extension count');
    }

    return Result.ok(
      new Auction(
        id,
        sellerId,
        auctionType,
        title.trim(),
        description?.trim() ?? '',
        category?.trim() ?? '',
        condition?.trim() ?? '',
        startPrice,
        minIncrement,
        startAt,
        endAt,
        status,
        antiSnipSeconds,
        extensionCount,
        maxExtensionCount,
        bidCooldownSeconds,
        winnerId ?? null,
        assets,
      ),
    );
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

  getCategory(): string {
    return this.category;
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
}

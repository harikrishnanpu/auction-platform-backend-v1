import { Result } from '@domain/shared/result';

export class Bid {
  constructor(
    private readonly id: string,
    private readonly auctionId: string,
    private readonly userId: string,
    private readonly amount: number,
    private readonly createdAt: Date,
  ) {}

  static create({
    id,
    auctionId,
    userId,
    amount,
    createdAt = new Date(),
  }: {
    id: string;
    auctionId: string;
    userId: string;
    amount: number;
    createdAt?: Date;
  }): Result<Bid> {
    return Result.ok(new Bid(id, auctionId, userId, amount, createdAt));
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

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

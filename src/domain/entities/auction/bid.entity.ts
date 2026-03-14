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
    if (!id?.trim()) return Result.fail('Bid id is required');
    if (!auctionId?.trim()) return Result.fail('Auction id is required');
    if (!userId?.trim()) return Result.fail('User id is required');
    if (typeof amount !== 'number' || amount < 0)
      return Result.fail('Amount must be a non-negative number');

    const date =
      createdAt instanceof Date ? createdAt : new Date(createdAt as string);
    return Result.ok(new Bid(id, auctionId, userId, amount, date));
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

import { Result } from '@domain/shared/result';

export class AuctionParticipant {
  constructor(
    private readonly id: string,
    private readonly auctionId: string,
    private readonly userId: string,
    private readonly userName: string,
    private readonly joinedAt: Date,
  ) {}

  static create({
    id,
    auctionId,
    userId,
    userName,
    joinedAt = new Date(),
  }: {
    id: string;
    auctionId: string;
    userId: string;
    userName: string;
    joinedAt?: Date;
  }): Result<AuctionParticipant> {
    return Result.ok(
      new AuctionParticipant(id, auctionId, userId, userName, joinedAt),
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
}

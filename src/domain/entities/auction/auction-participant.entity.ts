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
    if (!id?.trim()) return Result.fail('Participant id is required');
    if (!auctionId?.trim()) return Result.fail('Auction id is required');
    if (!userId?.trim()) return Result.fail('User id is required');
    if (!userName?.trim()) return Result.fail('User name is required');

    const date =
      joinedAt instanceof Date ? joinedAt : new Date(joinedAt as string);
    return Result.ok(
      new AuctionParticipant(id, auctionId, userId, userName.trim(), date),
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

  getUserName(): string {
    return this.userName;
  }

  getJoinedAt(): Date {
    return this.joinedAt;
  }
}

import { Result } from '@domain/shared/result';

export class AuctionChatMessage {
  constructor(
    private readonly id: string,
    private readonly auctionId: string,
    private readonly userId: string,
    private readonly userName: string,
    private readonly message: string,
    private readonly createdAt: Date,
  ) {}

  static create({
    id,
    auctionId,
    userId,
    userName,
    message,
    createdAt = new Date(),
  }: {
    id: string;
    auctionId: string;
    userId: string;
    userName: string;
    message: string;
    createdAt?: Date;
  }): Result<AuctionChatMessage> {
    if (!userName || !userName.trim()) {
      return Result.fail('User name is required');
    }
    if (!message || message.trim().length < 1) {
      return Result.fail('Message is required');
    }
    if (message.trim().length > 1000) {
      return Result.fail('Message is too long');
    }
    return Result.ok(
      new AuctionChatMessage(
        id,
        auctionId,
        userId,
        userName.trim(),
        message.trim(),
        createdAt,
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

  getUserName(): string {
    return this.userName;
  }

  getMessage(): string {
    return this.message;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}

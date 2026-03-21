export interface IBidLockService {
  lockKeyForAuction(auctionId: string): string;
  lock(lockKey: string, token: string, ttlSeconds: number): Promise<boolean>;
  release(lockKey: string, token: string): Promise<void>;
}

import { IBidLockService } from '@application/interfaces/services/IBidLockService';
import { TYPES } from '@di/types.di';
import { inject, injectable } from 'inversify';
import type { Redis } from 'ioredis';

const RELEASE_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

@injectable()
export class BidLockService implements IBidLockService {
  constructor(@inject(TYPES.Redis) private readonly redis: Redis) {}

  lockKeyForAuction(auctionId: string): string {
    return `lock:auction:bid:${auctionId}`;
  }

  async lock(
    lockKey: string,
    token: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const res = await this.redis.set(lockKey, token, 'EX', ttlSeconds, 'NX');

    return res === 'OK';
  }

  async release(lockKey: string, token: string): Promise<void> {
    try {
      await this.redis.eval(RELEASE_SCRIPT, 1, lockKey, token);
    } catch {
      console.log('Failed to release lock', lockKey, token);
    }
  }
}

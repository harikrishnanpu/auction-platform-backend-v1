import { ICacheService } from '@application/interfaces/services/ICacheService';
import { redis } from '@infrastructure/redis/redis.client';
import { Redis } from 'ioredis';
import { Result } from '@domain/shared/result';

export class CacheService implements ICacheService {
    private _redis: Redis;

    constructor() {
        this._redis = redis;
    }

    async get(key: string): Promise<Result<string | null>> {
        const result = await this._redis.get(key);
        if (!result) {
            return Result.ok(null);
        }
        return Result.ok(result);
    }

    async set(key: string, value: string, ttl: number): Promise<Result<void>> {
        await this._redis.set(key, value, 'EX', ttl);
        return Result.ok();
    }
}

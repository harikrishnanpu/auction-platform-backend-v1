import { TYPES } from '@di/types.di';
import { redis } from '@infrastructure/redis/redis.client';
import { BidLockService } from '@infrastructure/services/lock/bid.lock.service';
import { ContainerModule } from 'inversify';
import type { Redis } from 'ioredis';

import { IBidLockService } from '@application/interfaces/services/IBidLockService';

export const redisContainer = new ContainerModule(({ bind }) => {
  bind<Redis>(TYPES.Redis).toConstantValue(redis);
  bind<IBidLockService>(TYPES.IBidLockService)
    .to(BidLockService)
    .inSingletonScope();
});

import { redisConfig } from '@config/redis.config';
import IORedis from 'ioredis';

export const redis = new IORedis(redisConfig);

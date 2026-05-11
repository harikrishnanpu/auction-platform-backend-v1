import { Result } from '@domain/shared/result';

export interface ICacheService {
    get(key: string): Promise<Result<string | null>>;
    set(key: string, value: string, ttl: number): Promise<Result<void>>;
}

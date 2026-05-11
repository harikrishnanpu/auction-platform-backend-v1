import { Features } from '@domain/entities/subscription/features.entity';
import { Result } from '@domain/shared/result';

export interface ISubscriptionFeaturesRepository {
    findAll(filters: { updatedAt?: Date }): Promise<Result<Features[]>>;
    findByIds(ids: string[]): Promise<Result<Features[]>>;
}

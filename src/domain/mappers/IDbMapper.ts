import { Result } from '@domain/shared/result';

export type IDbMapper<Entity, Persistence> = {
    toDomain(response: Persistence): Result<Entity>;
    toPersistence(entity: Entity): unknown;
};

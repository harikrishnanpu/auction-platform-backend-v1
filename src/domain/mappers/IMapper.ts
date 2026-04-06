import { Result } from '@domain/shared/result';

export type IMapper<Entity, Response> = {
    toDomain(response: Response): Result<Entity>;
    toPersistence(entity: Entity): Response;
};

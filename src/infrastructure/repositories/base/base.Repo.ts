import { IDbMapper } from '@domain/mappers/IDbMapper';
import { IRead, IWrite } from '@domain/repositories/base/base.Repo';
import { Result } from '@domain/shared/result';
import { PrismaDelegate } from '@infrastructure/database/prismaDeligate';

export abstract class BaseRepository<
    Entity,
    Persistence extends { id: string },
    Filters,
    DbMapper extends IDbMapper<Entity, Persistence>,
>
    implements IWrite<Entity>, IRead<Entity, Filters>
{
    constructor(
        protected readonly model: PrismaDelegate<Persistence, Filters>,
        protected readonly mapper: DbMapper,
    ) {}

    async save(entity: Entity): Promise<Result<Entity>> {
        console.log('BSREPO__ ENTITY SAVE: ', entity);
        try {
            const persistence = this.mapper.toPersistence(
                entity,
            ) as Persistence;

            const rawRes = await this.model.upsert({
                where: { id: persistence.id },
                create: persistence,
                update: persistence,
            });

            return this.mapper.toDomain(rawRes);
        } catch (err) {
            console.log('BSREPO__ ERROR SAVE: ', err);
            return Result.fail('UNEXPECTED ERROR IN SAVE- BSREPO');
        }
    }

    async create(entity: Entity): Promise<Result<Entity>> {
        try {
            const persistence = this.mapper.toPersistence(
                entity,
            ) as Persistence;

            const rawRes = await this.model.create({
                data: persistence,
            });

            return this.mapper.toDomain(rawRes);
        } catch {
            return Result.fail('UNEXPECTED ERROR IN CREATE- BSREPO');
        }
    }

    async update(id: string, entity: Entity): Promise<Result<Entity>> {
        try {
            const persistence = this.mapper.toPersistence(
                entity,
            ) as Persistence;

            const rawRes = await this.model.update({
                where: { id },
                data: persistence,
            });

            return this.mapper.toDomain(rawRes);
        } catch {
            return Result.fail('UNEXPECTED ERROR IN UPDATE- BSREPO');
        }
    }

    async delete(id: string): Promise<Result<void>> {
        try {
            // return
            return Result.fail(`NOT IMPLEMENTED: ${id}`);
        } catch {
            return Result.fail('UNEXPECTED ERROR IN DELETE- BSREPO');
        }
    }

    async findById(id: string): Promise<Result<Entity | null>> {
        try {
            const raw = await this.model.findUnique({
                where: { id },
            });

            if (!raw) {
                return Result.fail('Entity not found');
            }

            return this.mapper.toDomain(raw);
        } catch {
            return Result.fail('UNEXPECTED ERROR IN FINDBYID- BSREPO');
        }
    }

    async findAll(filters: Filters): Promise<Result<Entity[] | []>> {
        try {
            const raw = await this.model.findMany({
                where: filters,
            });

            const entities: Entity[] = [];

            for (const data of raw) {
                const mapped = this.mapper.toDomain(data);
                entities.push(mapped.getValue());
            }

            return Result.ok(entities);
        } catch {
            return Result.fail('UNEXPECTED ERROR IN FINDALL- BSREPO');
        }
    }
}

// import { IMapper } from '@domain/mappers/IMapper'; -- need correct
import { IRead, IWrite } from '@domain/repositories/base/base.Repo';
import { Result } from '@domain/shared/result';

export abstract class BaseRepository<Entity, Response, Filters>
    implements IWrite<Entity>, IRead<Entity, Filters>
{
    constructor(
        // @ts-expect-error not got prisma type
        protected readonly model,
        // @ts-expect-error not got correct mapper class.;-  static funciton
        protected readonly mapper,
    ) {}

    async create(data: Entity): Promise<Result<void>> {
        await this.model.create({
            data,
        });
        return Result.ok();
    }

    async update(id: string, data: Entity): Promise<Result<void>> {
        await this.model.update({
            where: {
                id,
            },
            data,
        });

        return Result.ok();
    }

    async delete(): Promise<Result<void>> {
        return Result.fail('dd');
    }

    async findById(id: string): Promise<Result<Entity>> {
        const raw = this.model.findOne({
            where: {
                id: id,
            },
        });

        const mapperResult = this.mapper.toDomain(raw);

        return Result.ok(mapperResult.getValue());
    }

    async findAll(filters: Filters): Promise<Result<Entity[]>> {
        const raw = this.model.findMany({
            where: filters,
        });

        const mapperResult = raw.map((item: Response) =>
            this.mapper.toDomain(item).getValue(),
        );
        return Result.ok(mapperResult);
    }
}

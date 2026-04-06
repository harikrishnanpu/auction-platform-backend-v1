import { IRead, IWrite } from '@domain/repositories/base/base.Repo';
import { Result } from '@domain/shared/result';

export abstract class BaseRepository<T, F> implements IWrite<T>, IRead<T, F> {
    constructor(
        // @ts-expect-error not got prisma type
        protected readonly model,
    ) {}

    async create(data: T): Promise<Result<void>> {
        await this.model.create({
            data,
        });
        return Result.ok();
    }

    async update(id: string, data: T): Promise<Result<void>> {
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

    async findById(id: string): Promise<Result<T>> {
        const data = this.model.findOne({
            where: {
                id: id,
            },
        });
        return Result.ok(data);
    }

    async findAll(filter: F): Promise<Result<T[]>> {
        const data = this.model.findMany({
            where: filter,
        });
        return Result.ok(data);
    }
}

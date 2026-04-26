import { TYPES } from '@di/types.di';
import { UserSuspension } from '@domain/entities/fraud/user-suspension.entity';
import { IUserSuspensionRepository } from '@domain/repositories/IUserSuspensionRepository';
import { Result } from '@domain/shared/result';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import {
    Prisma,
    PrismaClient,
    UserSuspension as PrismaUserSuspension,
} from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';

@injectable()
export class PrismaUserSuspensionRepository
    extends BaseRepository<
        UserSuspension,
        PrismaUserSuspension,
        Prisma.UserSuspensionWhereInput,
        IDbMapper<UserSuspension, PrismaUserSuspension>
    >
    implements IUserSuspensionRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.UserSuspensionMapper)
        readonly mapper: IDbMapper<UserSuspension, PrismaUserSuspension>,
    ) {
        super(_prisma.userSuspension, mapper);
    }

    async findUserSuspensions(
        userId: string,
    ): Promise<Result<UserSuspension[]>> {
        const rows = await this._prisma.userSuspension.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        const timeline: UserSuspension[] = [];

        for (const row of rows) {
            const mapped = this.mapper.toDomain(row);
            if (mapped.isFailure) return Result.fail(mapped.getError());
            timeline.push(mapped.getValue());
        }

        return Result.ok(timeline);
    }
}

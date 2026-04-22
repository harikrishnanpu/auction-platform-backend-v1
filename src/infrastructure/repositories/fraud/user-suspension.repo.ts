import { TYPES } from '@di/types.di';
import { UserSuspension } from '@domain/entities/fraud/user-suspension.entity';
import {
    IFindSuspendedUsersFilters,
    IFindSuspendedUsersOutput,
    IUserSuspensionRepository,
} from '@domain/repositories/IUserSuspensionRepository';
import { Result } from '@domain/shared/result';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import {
    Prisma,
    PrismaClient,
    UserSuspension as PrismaUserSuspension,
    UserStatus,
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

    async findSuspensionTimeline(
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

    async findSuspendedUsers(
        filters: IFindSuspendedUsersFilters,
    ): Promise<Result<IFindSuspendedUsersOutput>> {
        try {
            const where = {
                status: 'SUSPENDED' as UserStatus,
                ...(filters.search
                    ? {
                          $Or: [
                              {
                                  name: {
                                      contains: filters.search,
                                      mode: 'insensitive',
                                  },
                              },
                              {
                                  email: {
                                      contains: filters.search,
                                      mode: 'insensitive',
                                  },
                              },
                          ],
                      }
                    : {}),
            };

            const [users, total] = await Promise.all([
                this._prisma.user.findMany({
                    where,
                    skip: (filters.page - 1) * filters.limit,
                    take: filters.limit,
                    orderBy: { updatedAt: 'desc' },
                    include: {
                        suspensions: {
                            where: { isActive: true },
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                }),
                this._prisma.user.count({ where }),
            ]);

            return Result.ok({
                users: users.map((user) => ({
                    userId: user.id,
                    userName: user.name,
                    email: user.email,
                    status: user.status,
                    activeSuspensionType:
                        user.suspensions[0]?.type ?? 'TEMPORARY',
                    activeSuspensionEndsAt: user.suspensions[0]?.endsAt ?? null,
                })),
                total,
            });
        } catch (error) {
            console.log(error);
            return Result.fail('Failed to get suspended users');
        }
    }

    async incrementUserFraudLevel(
        userId: string,
        points: number,
    ): Promise<Result<number>> {
        try {
            const user = await this._prisma.user.update({
                where: { id: userId },
                data: { userFraudLevel: { increment: points } },
                select: { userFraudLevel: true },
            });
            return Result.ok(user.userFraudLevel);
        } catch (error) {
            console.log(error);
            return Result.fail('Failed to update user fraud level');
        }
    }

    async markUserSuspended(userId: string): Promise<Result<void>> {
        try {
            await this._prisma.user.update({
                where: { id: userId },
                data: { status: 'SUSPENDED' },
            });
            return Result.ok();
        } catch (error) {
            console.log(error);
            return Result.fail('Failed to suspend user');
        }
    }
}

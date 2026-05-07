import { ISubscribedUserDto } from '@application/dtos/admin/subscription.dto';
import { TYPES } from '@di/types.di';
import { UserSubscription } from '@domain/entities/subscription/user-subscription.entity';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import {
    PrismaClient,
    UserSubscriptionStatus as PrismaUserSubscriptionStatus,
    UserSubscription as PrismaUserSubscription,
} from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { IDbMapper } from '@domain/mappers/IDbMapper';

@injectable()
export class PrismaUserSubscriptionRepository
    extends BaseRepository<
        UserSubscription,
        PrismaUserSubscription,
        { updatedAt?: Date },
        IDbMapper<UserSubscription, PrismaUserSubscription>
    >
    implements IUserSubscriptionRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.UserSubscriptionMapper)
        private readonly _mapper: IDbMapper<
            UserSubscription,
            PrismaUserSubscription
        >,
    ) {
        super(_prisma.userSubscription, _mapper);
    }

    async findAllWithUserAndPlan(): Promise<Result<ISubscribedUserDto[]>> {
        const rows = await this._prisma.userSubscription.findMany({
            include: {
                user: true,
                subscriptionPlan: true,
            },
            orderBy: [
                {
                    subscriptionPlan: {
                        price: 'asc',
                    },
                },
            ],
        });

        const items: ISubscribedUserDto[] = [];
        for (const row of rows) {
            items.push({
                userId: row.user.id,
                name: row.user.name,
                email: row.user.email,
                planId: row.subscriptionPlan.id,
                planName: row.subscriptionPlan.name,
                status: row.status,
                startDate: row.startDate,
                endDate: row.endDate,
                razorpaySubscriptionId: row.razorpaySubscriptionId,
            });
        }

        return Result.ok(items);
    }

    async getByUserId(
        userId: string,
    ): Promise<Result<UserSubscription | null>> {
        const raw = await this._prisma.userSubscription.findFirst({
            where: {
                userId,
                status: PrismaUserSubscriptionStatus.ACTIVE,
                endDate: {
                    gt: new Date(),
                },
            },
            orderBy: { endDate: 'desc' },
        });

        if (!raw) {
            return Result.ok(null);
        }

        const mapped = this._mapper.toDomain(raw);
        if (mapped.isFailure) return Result.fail(mapped.getError());
        return Result.ok(mapped.getValue());
    }

    async findByRazorpaySubscriptionId(
        razorpaySubscriptionId: string,
    ): Promise<Result<UserSubscription | null>> {
        const row = await this._prisma.userSubscription.findFirst({
            where: { razorpaySubscriptionId },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!row) return Result.ok(null);
        const mapped = this._mapper.toDomain(row);
        if (mapped.isFailure) return Result.fail(mapped.getError());
        return Result.ok(mapped.getValue());
    }

    async expireAllActiveForUser(userId: string): Promise<Result<void>> {
        await this._prisma.userSubscription.updateMany({
            where: {
                userId,
                status: PrismaUserSubscriptionStatus.ACTIVE,
            },
            data: {
                status: PrismaUserSubscriptionStatus.EXPIRED,
            },
        });
        return Result.ok(undefined);
    }

    async findAllPlansByUserId(
        userId: string,
    ): Promise<Result<UserSubscription[]>> {
        const rows = await this._prisma.userSubscription.findMany({
            where: { userId },
            include: {
                subscriptionPlan: true,
            },
            orderBy: [
                {
                    subscriptionPlan: {
                        price: 'asc',
                    },
                },
            ],
        });

        const items: UserSubscription[] = [];

        for (const row of rows) {
            const mapped = this._mapper.toDomain(row);
            if (mapped.isFailure) return Result.fail(mapped.getError());
            items.push(mapped.getValue());
        }

        return Result.ok(items);
    }
}

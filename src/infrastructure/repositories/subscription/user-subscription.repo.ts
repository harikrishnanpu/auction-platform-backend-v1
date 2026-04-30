import { ISubscribedUserDto } from '@application/dtos/admin/subscription.dto';
import { TYPES } from '@di/types.di';
import { UserSubscription } from '@domain/entities/subscription/user-subscription.entity';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { UserSubscriptionMapper } from '@infrastructure/mappers/subscription/user-subscription.mapper';
import {
    PrismaClient,
    UserSubscriptionStatus as PrismaUserSubscriptionStatus,
} from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaUserSubscriptionRepository implements IUserSubscriptionRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.UserSubscriptionMapper)
        private readonly _mapper: UserSubscriptionMapper,
    ) {}

    async findAllWithUserAndPlan(): Promise<Result<ISubscribedUserDto[]>> {
        const rows = await this._prisma.userSubscription.findMany({
            include: {
                user: true,
                subscriptionPlan: true,
            },
            orderBy: { createdAt: 'desc' },
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

    async save(subscription: UserSubscription): Promise<Result<void>> {
        const row = this._mapper.toPersistence(subscription);

        await this._prisma.userSubscription.upsert({
            where: { id: row.id },
            update: row,
            create: row,
        });

        return Result.ok(undefined);
    }

    async update(subscription: UserSubscription): Promise<Result<void>> {
        const row = this._mapper.toPersistence(subscription);
        await this._prisma.userSubscription.update({
            where: { id: subscription.getId() },
            data: {
                subscriptionPlanId: row.subscriptionPlanId,
                razorpaySubscriptionId: row.razorpaySubscriptionId,
                status: row.status,
                startDate: row.startDate,
                endDate: row.endDate,
                updatedAt: row.updatedAt,
            },
        });
        return Result.ok(undefined);
    }

    async getByUserId(
        userId: string,
    ): Promise<Result<UserSubscription | null>> {
        const row = await this._prisma.userSubscription.findFirst({
            where: {
                userId,
                status: PrismaUserSubscriptionStatus.ACTIVE,
                endDate: {
                    gt: new Date(),
                },
                subscriptionPlan: {
                    is: {
                        isActive: true,
                    },
                },
            },
            orderBy: { endDate: 'desc' },
        });

        if (!row) {
            return Result.ok(null);
        }

        const mapped = this._mapper.toDomain(row);
        if (mapped.isFailure) return Result.fail(mapped.getError());
        return Result.ok(mapped.getValue());
    }

    async findByRazorpaySubscriptionId(
        razorpaySubscriptionId: string,
    ): Promise<Result<UserSubscription | null>> {
        const row = await this._prisma.userSubscription.findFirst({
            where: { razorpaySubscriptionId },
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
            data: { status: PrismaUserSubscriptionStatus.EXPIRED },
        });
        return Result.ok(undefined);
    }
}

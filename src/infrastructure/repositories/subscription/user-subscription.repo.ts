import { ISubscribedUserDto } from '@application/dtos/admin/subscription.dto';
import { TYPES } from '@di/types.di';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaUserSubscriptionRepository implements IUserSubscriptionRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
    ) {}

    async findAllWithUserAndPlan(): Promise<Result<ISubscribedUserDto[]>> {
        const rows = await this._prisma.userSubscription.findMany({
            include: {
                user: true,
                subscriptionPlan: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return Result.ok(
            rows.map((row) => ({
                userId: row.user.id,
                name: row.user.name,
                email: row.user.email,
                planId: row.subscriptionPlan.id,
                planName: row.subscriptionPlan.name,
                status: row.status,
                startDate: row.startDate,
                endDate: row.endDate,
            })),
        );
    }
}

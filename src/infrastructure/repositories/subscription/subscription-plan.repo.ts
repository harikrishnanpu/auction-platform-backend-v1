import { TYPES } from '@di/types.di';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import { PrismaClient, UserSubscriptionStatus } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { BaseRepository } from '../base/base.Repo';
import { SubscriptionPlan as PrismaSubscriptionPlan } from '@prisma/client';
import { PrismaSubscriptionPlanWithFeatures } from '@infrastructure/mappers/subscription/subscription-plan.mapper';

@injectable()
export class PrismaSubscriptionPlanRepository
    extends BaseRepository<
        SubscriptionPlan,
        PrismaSubscriptionPlan,
        { updatedAt?: Date; isActive?: boolean; isDefault?: boolean },
        IDbMapper<SubscriptionPlan, PrismaSubscriptionPlan>
    >
    implements ISubscriptionPlanRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.SubscriptionPlanMapper)
        private readonly _mapper: IDbMapper<
            SubscriptionPlan,
            PrismaSubscriptionPlan
        >,
    ) {
        super(_prisma.subscriptionPlan, _mapper);
    }

    async save(plan: SubscriptionPlan): Promise<Result<SubscriptionPlan>> {
        const persistence = this._mapper.toPersistence(
            plan,
        ) as PrismaSubscriptionPlanWithFeatures;

        const rawRes = await this._prisma.subscriptionPlan.upsert({
            where: { id: persistence.id },
            create: {
                ...persistence,
                features: {
                    create: persistence.features.map((feature) => ({
                        ...feature,
                        feature: {
                            connect: {
                                id: feature.feature.id,
                            },
                        },
                    })),
                },
            },
            update: {
                ...persistence,
                features: {
                    deleteMany: {},
                    create: persistence.features.map((feature) => ({
                        ...feature,
                        feature: {
                            connect: {
                                id: feature.feature.id,
                            },
                        },
                    })),
                },
            },
            include: {
                features: {
                    include: {
                        feature: true,
                    },
                },
            },
        });

        return this._mapper.toDomain(rawRes);
    }

    async findActiveDefault(): Promise<Result<SubscriptionPlan | null>> {
        const row = await this._prisma.subscriptionPlan.findFirst({
            where: { isDefault: true, isActive: true },
            include: {
                features: {
                    include: {
                        feature: true,
                    },
                },
            },
        });
        if (!row) return Result.ok(null);
        return this._mapper.toDomain(row);
    }

    async findAll(filters: {
        updatedAt?: Date;
        isActive?: boolean;
        isDefault?: boolean;
    }): Promise<Result<SubscriptionPlan[]>> {
        const rows = await this._prisma.subscriptionPlan.findMany({
            where: {
                isActive: filters.isActive ?? undefined,
                isDefault: filters.isDefault ?? undefined,
            },
            include: {
                features: {
                    include: {
                        feature: true,
                    },
                },
            },
            orderBy: {
                price: 'asc',
            },
        });

        // console.log(rows)

        const plans: SubscriptionPlan[] = [];

        for (const row of rows) {
            const mapped = this._mapper.toDomain(row);
            if (mapped.isFailure) return Result.fail(mapped.getError());
            plans.push(mapped.getValue());
        }

        return Result.ok(plans);
    }

    async findById(id: string): Promise<Result<SubscriptionPlan | null>> {
        const row = await this._prisma.subscriptionPlan.findUnique({
            where: { id },
            include: {
                features: {
                    include: {
                        feature: true,
                    },
                },
            },
        });
        if (!row) return Result.ok(null);
        return this._mapper.toDomain(row);
    }

    async isSubscribedUsersExist(planId: string): Promise<Result<boolean>> {
        const count = await this._prisma.userSubscription.count({
            where: {
                subscriptionPlanId: planId,
                status: UserSubscriptionStatus.ACTIVE,
            },
        });

        if (count > 0) return Result.ok(true);
        return Result.ok(false);
    }

    async findByName(name: string): Promise<Result<SubscriptionPlan | null>> {
        console.log('name =---', name);

        const row = await this._prisma.subscriptionPlan.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive',
                },
            },
        });

        if (!row) return Result.ok(null);

        const mapped = this._mapper.toDomain(row);
        if (mapped.isFailure) return Result.fail(mapped.getError());

        return Result.ok(mapped.getValue());
    }
}

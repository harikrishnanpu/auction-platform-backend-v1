import { TYPES } from '@di/types.di';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { BaseRepository } from '../base/base.Repo';
import { SubscriptionPlan as PrismaSubscriptionPlan } from '@prisma/client';

@injectable()
export class PrismaSubscriptionPlanRepository
    extends BaseRepository<
        SubscriptionPlan,
        PrismaSubscriptionPlan,
        { updatedAt?: Date },
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
        ) as PrismaSubscriptionPlan;

        const rawRes = await this._prisma.subscriptionPlan.upsert({
            where: { id: persistence.id },
            create: persistence,
            update: persistence,
        });

        return this._mapper.toDomain(rawRes);
    }

    async findActiveDefault(): Promise<Result<SubscriptionPlan | null>> {
        const row = await this._prisma.subscriptionPlan.findFirst({
            where: { isDefault: true, isActive: true },
            include: { features: true },
        });
        if (!row) return Result.ok(null);
        return this._mapper.toDomain(row);
    }

    async findAll(): Promise<Result<SubscriptionPlan[]>> {
        const rows = await this._prisma.subscriptionPlan.findMany({
            include: { features: true },
            orderBy: { createdAt: 'desc' },
        });

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
            include: { features: true },
        });
        if (!row) return Result.ok(null);
        return this._mapper.toDomain(row);
    }
}

import { TYPES } from '@di/types.di';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import {
    PrismaClient,
    SubscriptionPlanFeatureEnum,
    SubscriptionPlanFeatureType,
} from '@prisma/client';
import {
    SubscriptionPlanMapper,
    SubscriptionPlanPersistenceRow,
} from '@infrastructure/mappers/subscription/subscription-plan.mapper';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaSubscriptionPlanRepository implements ISubscriptionPlanRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.SubscriptionPlanMapper)
        private readonly _mapper: SubscriptionPlanMapper,
    ) {}

    async save(plan: SubscriptionPlan): Promise<Result<SubscriptionPlan>> {
        const row = await this._prisma.subscriptionPlan.create({
            data: {
                id: plan.getId(),
                name: plan.getName(),
                description: plan.getDescription(),
                price: plan.getPrice(),
                durationDays: plan.getDurationDays(),
                isDefault: plan.getIsDefault(),
                isActive: plan.getIsActive(),
                razorpayPlanId: plan.getRazorpayPlanId(),
                createdAt: plan.getCreatedAt(),
                updatedAt: plan.getUpdatedAt(),
                features: {
                    create: plan.getFeatures().map((feature) => ({
                        id: feature.getId(),
                        feature:
                            feature.getFeatureKey() as SubscriptionPlanFeatureEnum,
                        description: feature.getDescription(),
                        value: feature.getValue(),
                        type: feature.getType() as SubscriptionPlanFeatureType,
                        createdAt: feature.getCreatedAt(),
                        updatedAt: feature.getUpdatedAt(),
                    })),
                },
            },
            include: {
                features: true,
            },
        });

        return this._mapper.toDomain(row as SubscriptionPlanPersistenceRow);
    }

    async findActiveDefault(): Promise<Result<SubscriptionPlan | null>> {
        const row = await this._prisma.subscriptionPlan.findFirst({
            where: { isDefault: true, isActive: true },
            include: { features: true },
        });
        if (!row) return Result.ok(null);
        return this._mapper.toDomain(row as SubscriptionPlanPersistenceRow);
    }

    async findAll(): Promise<Result<SubscriptionPlan[]>> {
        const rows = await this._prisma.subscriptionPlan.findMany({
            include: { features: true },
            orderBy: { createdAt: 'desc' },
        });

        const plans: SubscriptionPlan[] = [];
        for (const row of rows) {
            const mapped = this._mapper.toDomain(
                row as SubscriptionPlanPersistenceRow,
            );
            if (mapped.isFailure) return Result.fail(mapped.getError());
            plans.push(mapped.getValue());
        }

        return Result.ok(plans);
    }

    async hasDefaultPlan(): Promise<Result<boolean>> {
        const count = await this._prisma.subscriptionPlan.count({
            where: { isDefault: true },
        });
        return Result.ok(count > 0);
    }

    async findById(id: string): Promise<Result<SubscriptionPlan | null>> {
        const row = await this._prisma.subscriptionPlan.findUnique({
            where: { id },
            include: { features: true },
        });
        if (!row) return Result.ok(null);
        return this._mapper.toDomain(row as SubscriptionPlanPersistenceRow);
    }

    async hasAnotherDefaultPlan(
        excludePlanId: string,
    ): Promise<Result<boolean>> {
        const count = await this._prisma.subscriptionPlan.count({
            where: {
                isDefault: true,
                id: { not: excludePlanId },
            },
        });
        return Result.ok(count > 0);
    }

    async updateStatus(
        id: string,
        input: {
            isDefault: boolean;
            isActive: boolean;
        },
    ): Promise<Result<SubscriptionPlan>> {
        const row = await this._prisma.subscriptionPlan.update({
            where: { id },
            data: {
                isDefault: input.isDefault,
                isActive: input.isActive,
            },
            include: { features: true },
        });

        return this._mapper.toDomain(row as SubscriptionPlanPersistenceRow);
    }
}

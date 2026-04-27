import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import {
    PrismaClient,
    SubscriptionPlanFeatureEnum,
    SubscriptionPlanFeatureType,
} from '@prisma/client';
import { SubscriptionPlanMapper } from '@infrastructure/mappers/subscription/subscription-plan.mapper';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaSubscriptionPlanRepository implements ISubscriptionPlanRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.SubscriptionPlanMapper)
        private readonly _mapper: SubscriptionPlanMapper,
    ) {}

    async create(input: {
        name: string;
        description: string;
        price: number;
        durationDays: number;
        features: {
            featureKey: string;
            value: string;
            type: string;
        }[];
    }): Promise<Result<ISubscriptionPlanDto>> {
        const row = await this._prisma.subscriptionPlan.create({
            data: {
                name: input.name,
                description: input.description,
                price: input.price,
                durationDays: input.durationDays,
                features: {
                    create: input.features.map((feature) => ({
                        feature:
                            feature.featureKey as SubscriptionPlanFeatureEnum,
                        value: feature.value,
                        type: feature.type as SubscriptionPlanFeatureType,
                    })),
                },
            },
            include: {
                features: true,
            },
        });

        return this._mapper.toDto(row);
    }

    async findAll(): Promise<Result<ISubscriptionPlanDto[]>> {
        const rows = await this._prisma.subscriptionPlan.findMany({
            include: { features: true },
            orderBy: { createdAt: 'desc' },
        });

        const plans: ISubscriptionPlanDto[] = [];
        for (const row of rows) {
            const mapped = this._mapper.toDto(row);
            if (mapped.isFailure) return Result.fail(mapped.getError());
            plans.push(mapped.getValue());
        }

        return Result.ok(plans);
    }
}

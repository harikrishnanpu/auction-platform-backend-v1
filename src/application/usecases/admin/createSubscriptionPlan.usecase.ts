import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import {
    ICreateSubscriptionPlanUsecase,
    IValidatedCreateSubscriptionPlanInput,
} from '@application/interfaces/usecases/admin/ICreateSubscriptionPlanUsecase';

import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import { SubscriptionFeatureValueType } from '@domain/entities/subscription/features.entity';
import { IRazorpaySubscriptionGatewayService } from '@application/interfaces/services/IRazorpaySubscriptionGatewayService';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { ISubscriptionFeaturesRepository } from '@domain/repositories/ISubscriptionFetauresRepository';
import { SubscriptionPlanFeature } from '@domain/entities/subscription/subscriptionPlanFetaure.entity';

@injectable()
export class CreateSubscriptionPlanUsecase implements ICreateSubscriptionPlanUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IRazorpaySubscriptionGatewayService)
        private readonly _razorpaySubscriptionGateway: IRazorpaySubscriptionGatewayService,
        @inject(TYPES.ISubscriptionFeaturesRepository)
        private readonly _subscriptionPFeatureRepository: ISubscriptionFeaturesRepository,
    ) {}

    async execute(
        input: IValidatedCreateSubscriptionPlanInput,
    ): Promise<Result<ISubscriptionPlanDto>> {
        const dto = AdminMapperProfile.toCreateSubscriptionPlanDto(input);
        const planId = this._idGeneratingService.generateId();

        if (dto.isDefault) {
            const hasDefaultResult =
                await this._subscriptionPlanRepository.findActiveDefault();
            if (hasDefaultResult.isFailure)
                return Result.fail(hasDefaultResult.getError());
            if (hasDefaultResult.getValue()) {
                return Result.fail(
                    'Already a default subscription plan exists',
                );
            }
        }

        const features = await this._subscriptionPFeatureRepository.findByIds(
            dto.features.map((feature) => feature.featureId),
        );
        if (features.isFailure) return Result.fail(features.getError());

        const featuresEntities: SubscriptionPlanFeature[] = [];
        for (const feat of dto.features) {
            const dbFeature = features
                .getValue()
                .find((itm) => itm.getId() == feat.featureId);
            if (!dbFeature) return Result.fail('Feature not found');

            const valueType = dbFeature.getType();

            switch (valueType) {
                case SubscriptionFeatureValueType.BOOLEAN:
                    if (!['true', 'false'].includes(feat.value.toLowerCase()))
                        return Result.fail('Invalid value for boolean feature');
                    break;
                case SubscriptionFeatureValueType.NUMBER:
                    if (isNaN(Number(feat.value)))
                        return Result.fail('Invalid value for number feature');
                    break;
                case SubscriptionFeatureValueType.STRING:
                    break;
                default:
                    return Result.fail('Invalid value type');
            }

            featuresEntities.push(
                SubscriptionPlanFeature.create({
                    id: this._idGeneratingService.generateId(),
                    subscriptionPlanId: planId,
                    featureId: feat.featureId,
                    value: feat.value,
                    feature: dbFeature,
                }).getValue(),
            );
        }

        let razorpayPlanId: string | null = null;

        const needsRazorpayPlan = dto.price > 0 && !dto.isDefault;

        if (needsRazorpayPlan) {
            const rzPlan = await this._razorpaySubscriptionGateway.createPlan({
                name: dto.name,
                description: dto.description,
                amountRupees: dto.price,
                durationDays: dto.durationDays,
                appPlanId: planId,
            });

            if (rzPlan.isFailure) {
                return Result.fail(rzPlan.getError());
            }
            razorpayPlanId = rzPlan.getValue().razorpayPlanId;
        }

        const planResult = SubscriptionPlan.create({
            id: planId,
            name: dto.name,
            description: dto.description,
            price: dto.price,
            durationDays: dto.durationDays,
            isDefault: dto.isDefault,
            isActive: true,
            razorpayPlanId,
            features: featuresEntities,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        if (planResult.isFailure) {
            return Result.fail(planResult.getError());
        }

        const savedResult = await this._subscriptionPlanRepository.save(
            planResult.getValue(),
        );
        if (savedResult.isFailure) return Result.fail(savedResult.getError());

        return Result.ok(
            AdminMapperProfile.toSubscriptionPlanDto(savedResult.getValue()),
        );
    }
}

import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ISubscriptionFeaturesService } from '@application/interfaces/services/ISubscriptionFeaturesService';
import { ICreateSubscriptionPlanUsecase } from '@application/interfaces/usecases/admin/ICreateSubscriptionPlanUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import { SubscriptionPlanFeature } from '@domain/entities/subscription/subscription-plan-feature.entity';
import { IRazorpaySubscriptionGatewayService } from '@application/interfaces/services/IRazorpaySubscriptionGatewayService';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import { ZodCreateSubscriptionPlanInputType } from '@presentation/validators/schemas/admin/createSubscriptionPlan.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class CreateSubscriptionPlanUsecase implements ICreateSubscriptionPlanUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @inject(TYPES.ISubscriptionFeaturesService)
        private readonly _subscriptionFeaturesService: ISubscriptionFeaturesService,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IRazorpaySubscriptionGatewayService)
        private readonly _razorpaySubscriptionGateway: IRazorpaySubscriptionGatewayService,
    ) {}

    async execute(
        input: ZodCreateSubscriptionPlanInputType,
    ): Promise<Result<ISubscriptionPlanDto>> {
        const request =
            AdminMapperProfile.toCreateSubscriptionPlanRequestDto(input);

        const normalizedResult =
            this._subscriptionFeaturesService.validateAndNormalizePlanInput(
                request,
            );
        if (normalizedResult.isFailure)
            return Result.fail(normalizedResult.getError());

        const normalized = normalizedResult.getValue();

        if (normalized.isDefault) {
            const hasDefaultResult =
                await this._subscriptionPlanRepository.hasDefaultPlan();
            if (hasDefaultResult.isFailure)
                return Result.fail(hasDefaultResult.getError());
            if (hasDefaultResult.getValue()) {
                return Result.fail(
                    'Already a default subscription plan exists',
                );
            }
        }

        const now = new Date();
        const planId = this._idGeneratingService.generateId();

        let razorpayPlanId: string | null = null;
        const needsRazorpayPlan = normalized.price > 0 && !normalized.isDefault;
        if (needsRazorpayPlan) {
            const rzPlan = await this._razorpaySubscriptionGateway.createPlan({
                name: normalized.name,
                description: normalized.description,
                amountRupees: normalized.price,
                durationDays: normalized.durationDays,
                appPlanId: planId,
            });
            if (rzPlan.isFailure) {
                return Result.fail(rzPlan.getError());
            }
            razorpayPlanId = rzPlan.getValue().razorpayPlanId;
        }

        const featureEntities: SubscriptionPlanFeature[] = [];
        for (const f of normalized.features) {
            const featureResult = SubscriptionPlanFeature.create({
                id: this._idGeneratingService.generateId(),
                featureKey: f.featureKey,
                description: f.description,
                value: f.value,
                type: f.type,
                createdAt: now,
                updatedAt: now,
            });
            if (featureResult.isFailure) {
                return Result.fail(featureResult.getError());
            }
            featureEntities.push(featureResult.getValue());
        }

        const planResult = SubscriptionPlan.create({
            id: planId,
            name: normalized.name,
            description: normalized.description,
            price: normalized.price,
            durationDays: normalized.durationDays,
            isDefault: normalized.isDefault,
            isActive: true,
            razorpayPlanId,
            features: featureEntities,
            createdAt: now,
            updatedAt: now,
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

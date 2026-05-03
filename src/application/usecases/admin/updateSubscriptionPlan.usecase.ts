import { ISubscriptionPlanDto } from '@application/dtos/admin/subscription.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IRazorpaySubscriptionGatewayService } from '@application/interfaces/services/IRazorpaySubscriptionGatewayService';
import { IUpdateSubscriptionPlanUsecase } from '@application/interfaces/usecases/admin/IUpdateSubscriptionPlanUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { SubscriptionFeatureValueType } from '@domain/entities/subscription/features.entity';
import { SubscriptionPlanFeature } from '@domain/entities/subscription/subscriptionPlanFetaure.entity';
import { ISubscriptionFeaturesRepository } from '@domain/repositories/ISubscriptionFetauresRepository';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import { ZodUpdateSubscriptionPlanInputType } from '@presentation/validators/schemas/admin/updateSubscriptionPlan.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class UpdateSubscriptionPlanUsecase implements IUpdateSubscriptionPlanUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @inject(TYPES.ISubscriptionFeaturesRepository)
        private readonly _subscriptionPFeatureRepository: ISubscriptionFeaturesRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IRazorpaySubscriptionGatewayService)
        private readonly _razorpaySubscriptionGateway: IRazorpaySubscriptionGatewayService,
    ) {}

    async execute(
        input: ZodUpdateSubscriptionPlanInputType,
    ): Promise<Result<ISubscriptionPlanDto>> {
        const dto = AdminMapperProfile.toUpdateSubscriptionPlanDto(input);

        const planEntityResult =
            await this._subscriptionPlanRepository.findById(dto.planId);

        if (planEntityResult.isFailure) {
            return Result.fail(planEntityResult.getError());
        }

        const planEntity = planEntityResult.getValue();

        if (!planEntity) {
            return Result.fail('Plan not found');
        }

        planEntity.updateStatus(dto.isDefault, dto.isActive);
        planEntity.update(dto.name, dto.description);

        const isPriceChanged = planEntity.getPrice() !== dto.price;
        const isFeaturesChanged =
            planEntity.getFeatures().length !== dto.features.length ||
            planEntity.getFeatures().some((existing) => {
                const incoming = dto.features.find(
                    (f) => f.featureId === existing.getFeatureId(),
                );

                if (!incoming) return true;

                return existing.getValue() !== incoming.value;
            });

        const isDurationDaysChanged =
            dto.durationDays !== planEntity.getDurationDays();

        const isSubscribedUsersExist =
            await this._subscriptionPlanRepository.isSubscribedUsersExist(
                dto.planId,
            );

        if (isSubscribedUsersExist.isFailure) {
            return Result.fail(isSubscribedUsersExist.getError());
        }

        const isCreateNewRazorpayPlan =
            isPriceChanged || isFeaturesChanged || isDurationDaysChanged;

        console.log(isCreateNewRazorpayPlan);

        if (isCreateNewRazorpayPlan && isSubscribedUsersExist.getValue()) {
            return Result.fail('Plan already in use. Create a new version.');
        }

        if (isPriceChanged) {
            planEntity.updatePrice(dto.price);
        }

        if (isDurationDaysChanged) {
            planEntity.updateDurationDays(dto.durationDays);
        }

        if (isFeaturesChanged) {
            const featureEntities =
                await this._subscriptionPFeatureRepository.findByIds(
                    dto.features.map((f) => f.featureId),
                );
            if (featureEntities.isFailure)
                return Result.fail(featureEntities.getError());

            const existingFeaturesByFeatureId = new Map(
                planEntity
                    .getFeatures()
                    .map((feature) => [feature.getFeatureId(), feature]),
            );

            const featuresEntities: SubscriptionPlanFeature[] = [];
            for (const feat of dto.features) {
                const featureEntity = featureEntities
                    .getValue()
                    .find((f) => f.getId() === feat.featureId);
                if (!featureEntity) return Result.fail('Feature not found');

                switch (featureEntity.getType()) {
                    case SubscriptionFeatureValueType.BOOLEAN:
                        if (
                            !['true', 'false'].includes(
                                feat.value.toLowerCase(),
                            )
                        ) {
                            return Result.fail(
                                'Invalid value for boolean feature',
                            );
                        }
                        break;
                    case SubscriptionFeatureValueType.NUMBER:
                        if (isNaN(Number(feat.value))) {
                            return Result.fail(
                                'Invalid value for number feature',
                            );
                        }
                        break;
                    case SubscriptionFeatureValueType.STRING:
                        break;
                    default:
                        return Result.fail('Invalid value type');
                }

                const existingFeature = existingFeaturesByFeatureId.get(
                    feat.featureId,
                );

                const subscriptionPlanFeature = SubscriptionPlanFeature.create({
                    id:
                        existingFeature?.getId() ??
                        this._idGeneratingService.generateId(),
                    subscriptionPlanId: planEntity.getId(),
                    featureId: feat.featureId,
                    value: feat.value,
                    feature: featureEntity,
                });

                if (subscriptionPlanFeature.isFailure) {
                    return Result.fail(subscriptionPlanFeature.getError());
                }

                featuresEntities.push(subscriptionPlanFeature.getValue());
            }

            planEntity.updateFeatures(featuresEntities);
        }

        const savedResult =
            await this._subscriptionPlanRepository.save(planEntity);
        if (savedResult.isFailure) return Result.fail(savedResult.getError());

        return Result.ok(
            AdminMapperProfile.toSubscriptionPlanDto(savedResult.getValue()),
        );
    }
}

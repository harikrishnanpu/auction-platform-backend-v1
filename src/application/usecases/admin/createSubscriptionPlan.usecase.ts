import {
    ICreateSubscriptionPlanInputDto,
    ISubscriptionPlanDto,
} from '@application/dtos/admin/subscription.dto';
import { ISubscriptionFeaturesService } from '@application/interfaces/services/ISubscriptionFeaturesService';
import { ICreateSubscriptionPlanUsecase } from '@application/interfaces/usecases/admin/ICreateSubscriptionPlanUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
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
    ) {}

    async execute(
        input: ZodCreateSubscriptionPlanInputType,
    ): Promise<Result<ISubscriptionPlanDto>> {
        const dto: ICreateSubscriptionPlanInputDto =
            AdminMapperProfile.toCreateSubscriptionPlanInputDto(input);

        const normalizedResult =
            this._subscriptionFeaturesService.validateAndNormalizePlanInput(
                dto,
            );
        if (normalizedResult.isFailure)
            return Result.fail(normalizedResult.getError());

        return this._subscriptionPlanRepository.create({
            ...normalizedResult.getValue(),
            features: normalizedResult.getValue().features.map((feature) => ({
                featureKey: feature.featureKey,
                value: feature.value,
                type: feature.type,
            })),
        });
    }
}

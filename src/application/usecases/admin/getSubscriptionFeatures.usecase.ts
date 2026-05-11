import { IGetSubscriptionFeaturesOutputDto } from '@application/dtos/admin/subscription.dto';
import { IGetSubscriptionFeaturesUsecase } from '@application/interfaces/usecases/admin/IGetSubscriptionFeatureUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { ISubscriptionFeaturesRepository } from '@domain/repositories/ISubscriptionFetauresRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetSubscriptionFeaturesUsecase implements IGetSubscriptionFeaturesUsecase {
    constructor(
        @inject(TYPES.ISubscriptionFeaturesRepository)
        private readonly _subscriptionFeaturesRepository: ISubscriptionFeaturesRepository,
    ) {}

    async execute(): Promise<Result<IGetSubscriptionFeaturesOutputDto>> {
        const featuresResult =
            await this._subscriptionFeaturesRepository.findAll({});
        if (featuresResult.isFailure)
            return Result.fail(featuresResult.getError());

        console.log(featuresResult.getValue());

        const mappedFeatures = AdminMapperProfile.toSubscriptionFeaturesDto(
            featuresResult.getValue(),
        );

        return Result.ok({ features: mappedFeatures });
    }
}

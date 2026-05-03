import { IPublicSubscriptionPlaDto } from '@application/dtos/user/publicSubscriptionPlan.dto';
import { IGetPublicSubscriptionPlansUsecase } from '@application/interfaces/usecases/subscription/IGetPublicSubscriptionPlansUsecase';
import { PublicUsersubcriptionPlanMapper } from '@application/mappers/subscription/publicUsersubcriptionPlan.mapper';
import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetPublicSubscriptionPlansUsecase implements IGetPublicSubscriptionPlansUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
    ) {}

    async execute(
        userId: string,
    ): Promise<Result<IPublicSubscriptionPlaDto[]>> {
        const userSubscriptionRes =
            await this._userSubscriptionRepository.getByUserId(userId);
        if (userSubscriptionRes.isFailure) {
            return Result.fail(userSubscriptionRes.getError());
        }

        const userSubscription = userSubscriptionRes.getValue();

        const allRes = await this._subscriptionPlanRepository.findAll({
            isActive: true,
        });
        if (allRes.isFailure) {
            return Result.fail(allRes.getError());
        }

        const output: IPublicSubscriptionPlaDto[] = [];

        let rank = 0;
        for (const plan of allRes.getValue()) {
            output.push(
                PublicUsersubcriptionPlanMapper.toPublicSubscriptionPlanDto(
                    plan,
                    userSubscription?.getSubscriptionPlanId() === plan.getId(),
                    rank++,
                ),
            );
        }

        console.log(output);

        return Result.ok(output);
    }
}

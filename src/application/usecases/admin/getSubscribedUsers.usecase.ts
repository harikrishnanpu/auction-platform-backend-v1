import { IGetSubscribedUsersOutputDto } from '@application/dtos/admin/subscription.dto';
import { IGetSubscribedUsersUsecase } from '@application/interfaces/usecases/admin/IGetSubscribedUsersUsecase';
import { TYPES } from '@di/types.di';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetSubscribedUsersUsecase implements IGetSubscribedUsersUsecase {
    constructor(
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
    ) {}

    async execute(): Promise<Result<IGetSubscribedUsersOutputDto>> {
        const subscriptionsResult =
            await this._userSubscriptionRepository.findAllWithUserAndPlan();
        if (subscriptionsResult.isFailure)
            return Result.fail(subscriptionsResult.getError());

        return Result.ok({
            subscriptions: subscriptionsResult.getValue(),
        });
    }
}

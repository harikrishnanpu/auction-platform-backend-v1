import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { IGetUserUsecase } from '@application/interfaces/usecases/auth/IGetUserUsecase';
import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { UserMapperProfile } from '@application/mappers/user/user.mapper';

@injectable()
export class GetUserUseCase implements IGetUserUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(userId: string): Promise<Result<userResponseDto>> {
        console.log('GETUSER USECASE CALLED --');

        const userResult = await this._userRepository.findById(userId);
        console.log('userResult is', userResult);
        if (userResult.isFailure) return Result.fail(userResult.getError());

        const user = userResult.getValue();

        const currentUserSubscriptionEntity =
            await this._userSubscriptionRepository.getByUserId(user.getId());
        if (currentUserSubscriptionEntity.isFailure) {
            return Result.fail(currentUserSubscriptionEntity.getError());
        }

        const currUserSubcptionEntity =
            currentUserSubscriptionEntity.getValue();
        if (!currUserSubcptionEntity) {
            const result = UserMapperProfile.toUserResponseDto(
                user,
                null,
                null,
            );
            return Result.ok(result);
        }

        const subscription = await this._subscriptionPlanRepository.findById(
            currUserSubcptionEntity.getSubscriptionPlanId(),
        );
        if (subscription.isFailure) {
            return Result.fail(subscription.getError());
        }
        const subscriptionEntity = subscription.getValue();

        const result = UserMapperProfile.toUserResponseDto(
            user,
            currUserSubcptionEntity,
            subscriptionEntity,
        );

        return Result.ok(result);
    }
}

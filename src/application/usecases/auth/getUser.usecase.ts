import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { UserRoleType } from '@application/dtos/auth/userRole.dto';
import { IGetUserUsecase } from '@application/interfaces/usecases/auth/IGetUserUsecase';
import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

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

        const subRes = await this._userSubscriptionRepository.getByUserId(
            user.getId(),
        );
        if (subRes.isFailure) return Result.fail(subRes.getError());
        const subscription = subRes.getValue();
        let planName: string | null = null;
        if (subscription) {
            const planRes = await this._subscriptionPlanRepository.findById(
                subscription.getSubscriptionPlanId(),
            );
            if (planRes.isFailure) return Result.fail(planRes.getError());
            planName = planRes.getValue()?.getName() ?? null;
        }

        return Result.ok({
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail().getValue(),
            phone: user.getPhone()?.getValue() ?? '',
            address: user.getAddress() ?? '',
            avatar_url: user.getAvatarUrl() ?? '',
            isProfileCompleted: user.isProfileCompleted(),
            isVerified: user.getIsVerified(),
            status: user.getStatus(),
            authProvider: user.getAuthProvider().getType(),
            roles: user
                .getRoles()
                .map((role) => role.getValue() as UserRoleType),
            subscription:
                subscription && planName
                    ? {
                          planId: subscription.getSubscriptionPlanId(),
                          planName,
                          status: subscription.getStatus(),
                          endDate: subscription.getEndDate().toISOString(),
                      }
                    : null,
        });
    }
}

import {
    IGetUserInput,
    IGetUserOutput,
} from '@application/dtos/admin/getUser.dto';
import { UserRoleType } from '@application/dtos/auth/userRole.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { IGetAdminUserUsecase } from '@application/interfaces/usecases/admin/IGetAdminUserUsecase';
import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAdminUserUseCase implements IGetAdminUserUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(data: IGetUserInput): Promise<Result<IGetUserOutput>> {
        try {
            const dto = AdminMapperProfile.toGetAdminUserInputDto(data);
            const { userId } = dto;

            const userResult = await this._userRepository.findById(userId);

            if (userResult.isFailure) {
                return Result.fail(userResult.getError());
            }

            const user = userResult.getValue();

            const subRes = await this._userSubscriptionRepository.getByUserId(
                user.getId(),
            );
            if (subRes.isFailure) return Result.fail(subRes.getError());
            const row = subRes.getValue();
            let planName: string | null = null;
            if (row) {
                const planRes = await this._subscriptionPlanRepository.findById(
                    row.getSubscriptionPlanId(),
                );
                if (planRes.isFailure) return Result.fail(planRes.getError());
                planName = planRes.getValue()?.getName() ?? null;
            }
            const userDto: userResponseDto = {
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
                    row && planName
                        ? {
                              planId: row.getSubscriptionPlanId(),
                              planName,
                              status: row.getStatus(),
                              endDate: row.getEndDate().toISOString(),
                          }
                        : null,
            };

            return Result.ok({
                user: userDto,
            });
        } catch (error) {
            console.log(error);
            return Result.fail('UNEXPECTED ERROR FROM GET USER USECASE');
        }
    }
}

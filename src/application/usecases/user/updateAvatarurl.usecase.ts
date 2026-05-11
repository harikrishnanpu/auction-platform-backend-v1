import { UpdateAvatarUrlResponseDto } from '@application/dtos/user/updateAvatar.dto';
import { UserRoleType } from '@application/dtos/auth/userRole.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { GenerateDownloadUrlData } from '@application/interfaces/services/IStorageService';
import {
    IUpdateAvatarUrlUsecase,
    IValidatedUpdateAvatarUrlInput,
} from '@application/interfaces/usecases/user/IUpdateAvatarUrl';

import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { UserMapperProfile } from '@application/mappers/user/user.mapper';

@injectable()
export class UpdateAvatarUrlUseCase implements IUpdateAvatarUrlUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(
        data: IValidatedUpdateAvatarUrlInput,
    ): Promise<Result<UpdateAvatarUrlResponseDto>> {
        try {
            const dto = UserMapperProfile.toUpdateAvatarUrlInput(data);
            const userEntity = await this._userRepository.findById(dto.userId);

            if (userEntity.isFailure) {
                return Result.fail(userEntity.getError());
            }

            userEntity.getValue().setAvatarUrl(dto.avatarKey);

            await this._userRepository.save(userEntity.getValue());
            console.log('userEntity', userEntity.getValue());

            const generateDownloadUrlData: GenerateDownloadUrlData = {
                fileKey: dto.avatarKey,
            };

            console.log('generateDownloadUrlData', generateDownloadUrlData);

            const user = userEntity.getValue();
            const subRes =
                await this._userSubscriptionRepository.findCurrentActiveByUserId(
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
        } catch (err) {
            console.log(err);
            return Result.fail(
                'UNEXPECTED ERROR FROM UPDATE AVATAR URL USECASE',
            );
        }
    }
}

import { CompleteProfileOutput } from '@application/dtos/auth/completeProfile.dto';
import { UserRoleType } from '@application/dtos/auth/userRole.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import {
    ICompleteProfileUsecase,
    IValidatedCompleteProfileInput,
} from '@application/interfaces/usecases/auth/ICompleteProfileUsecase';

import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { Phone } from '@domain/value-objects/phone.vo';
import { AuthMapperProfile } from '@infrastructure/mappers/auth/auth.mapper';
import { inject, injectable } from 'inversify';

@injectable()
export class CompleteProfileUsecase implements ICompleteProfileUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(
        data: IValidatedCompleteProfileInput,
    ): Promise<Result<CompleteProfileOutput>> {
        const dto = AuthMapperProfile.toCompleteProfileInput(data);

        const userEntity = await this._userRepository.findById(dto.userId);

        if (userEntity.isFailure) {
            return Result.fail(userEntity.getError());
        }

        const phoneVo = Phone.create(dto.phone);
        if (phoneVo.isFailure) {
            return Result.fail(phoneVo.getError());
        }

        userEntity.getValue().setPhone(phoneVo.getValue());
        userEntity.getValue().setAddress(dto.address);

        await this._userRepository.save(userEntity.getValue());

        const user = userEntity.getValue();
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
    }
}

import { EditProfileOutput } from '@application/dtos/user/editProfile.dto';
import { UserRoleType } from '@application/dtos/auth/userRole.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import type {
    IEditProfileUsecase,
    IValidatedEditProfileInput,
} from '@application/interfaces/usecases/user/IEditProfileUsecase';

import { UserMapperProfile } from '@application/mappers/user/user.mapper';
import { TYPES } from '@di/types.di';
import { OtpPurpose } from '@domain/entities/otp/otp.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class EditProfileUseCase implements IEditProfileUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IOtpRepository)
        private readonly _otpRepository: IOtpRepository,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(
        data: IValidatedEditProfileInput,
    ): Promise<Result<EditProfileOutput>> {
        try {
            const dto = UserMapperProfile.toEditProfileInput(data);

            const userEntity = await this._userRepository.findById(dto.userId);
            if (userEntity.isFailure) {
                return Result.fail(userEntity.getError());
            }

            const otpEntity =
                await this._otpRepository.findRecentOtpByUserIdAndPurpose(
                    userEntity.getValue().getId(),
                    OtpPurpose.EDIT_PROFILE,
                );

            if (!otpEntity) {
                return Result.fail('No Otp found');
            }

            if (otpEntity.isOtpExpired() || otpEntity.isOtpBlocked()) {
                return Result.fail('Otp expired');
            }

            if (otpEntity.getOtp() !== dto.otp) {
                otpEntity.incrementAttempts();
                await this._otpRepository.update(otpEntity.getId(), otpEntity);
                return Result.fail('Invalid otp');
            }

            const emailVo = Email.create(dto.email);
            if (emailVo.isFailure) {
                return Result.fail(emailVo.getError());
            }

            const phoneVo = Phone.create(dto.phone);
            if (phoneVo.isFailure) {
                return Result.fail(phoneVo.getError());
            }

            userEntity.getValue().setName(dto.name);
            userEntity.getValue().setEmail(emailVo.getValue());
            userEntity.getValue().setPhone(phoneVo.getValue());
            userEntity.getValue().setAddress(dto.address);

            await this._userRepository.save(userEntity.getValue());

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
        } catch (error) {
            console.log(error);
            return Result.fail('UNEXPECTED ERROR FROM EDIT PROFILE USECASE');
        }
    }
}

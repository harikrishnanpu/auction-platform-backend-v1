import {
    VerifyCredentialsInput,
    verifyCredentialsOutput,
} from '@application/dtos/auth/verifyCredentials.dto';
import { UserRoleType } from '@application/dtos/auth/userRole.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { IVerifyCredentialsUseCase } from '@application/interfaces/usecases/auth/IVerifyCredentialsUseCase';
import { TYPES } from '@di/types.di';
import { OtpStatus } from '@domain/entities/otp/otp.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { Email } from '@domain/value-objects/email.vo';
import { AuthMapperProfile } from '@infrastructure/mappers/auth/auth.mapper';
import { inject, injectable } from 'inversify';

@injectable()
export class VerifyCredentialsUseCase implements IVerifyCredentialsUseCase {
    constructor(
        @inject(TYPES.IOtpRepository)
        private readonly _otpRepository: IOtpRepository,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.ITokenGeneratorService)
        private readonly _tokenGenerator: ITokenGeneratorService,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(
        data: VerifyCredentialsInput,
    ): Promise<Result<verifyCredentialsOutput>> {
        try {
            const dto = AuthMapperProfile.toVerifyCredentialsInput(data);
            const { otp, email, purpose } = dto;

            const emailVo = Email.create(email);
            if (emailVo.isFailure) {
                return Result.fail('Invalid email');
            }

            const userEntity = await this._userRepository.findByEmail(
                emailVo.getValue(),
            );

            if (userEntity.isFailure) {
                return Result.fail('User not found');
            }

            const otpEntity =
                await this._otpRepository.findRecentOtpByUserIdAndPurpose(
                    userEntity.getValue().getId(),
                    purpose,
                );

            if (!otpEntity) {
                return Result.fail('Otp not found');
            }

            if (otpEntity.isOtpBlocked()) {
                return Result.fail('Otp blocked');
            }

            if (otpEntity.getOtp() !== otp) {
                otpEntity.incrementAttempts();
                console.log('otpEntity', otpEntity);
                await this._otpRepository.update(otpEntity.getId(), otpEntity);
                return Result.fail('Invalid otp 123');
            }

            if (otpEntity.getOtpStatus() !== OtpStatus.PENDING) {
                return Result.fail('Otp already verified');
            }

            otpEntity.setOtpStatus(OtpStatus.VERIFIED);
            await this._otpRepository.update(otpEntity.getId(), otpEntity);
            userEntity.getValue().setIsVerified(true);
            await this._userRepository.save(userEntity.getValue());

            const accessToken = this._tokenGenerator.generateAccessToken(
                userEntity.getValue().getId(),
            );
            const refreshToken = this._tokenGenerator.generateRefreshToken(
                userEntity.getValue().getId(),
            );

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

            const response: verifyCredentialsOutput = {
                user: userDto,
                accessToken,
                refreshToken,
            };

            return Result.ok(response);
        } catch (error) {
            console.log(error);
            return Result.fail(
                'UNEXPECTED ERROR FROM VERIFY CREDENTIALS USECASE',
            );
        }
    }
}

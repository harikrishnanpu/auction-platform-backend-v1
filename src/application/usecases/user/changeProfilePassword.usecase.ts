import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { IChangeProfilePasswordUsecase } from '@application/interfaces/usecases/user/IChangeProfilePassword';
import { TYPES } from '@di/types.di';
import { OtpPurpose, OtpStatus } from '@domain/entities/otp/otp.entity';
import { User } from '@domain/entities/user/user.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { inject, injectable } from 'inversify';
import { ZodChangeProfilePasswordInputType } from '@presentation/validators/schemas/user/change-profile-password.schema';
import { UserMapperProfile } from '@application/mappers/user/user.mapper';

@injectable()
export class ChangeProfilePasswordUseCase implements IChangeProfilePasswordUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IPasswordService)
        private readonly _passwordService: IPasswordService,
        @inject(TYPES.IOtpRepository)
        private readonly _otpRepository: IOtpRepository,
    ) {}

    async execute(
        data: ZodChangeProfilePasswordInputType,
    ): Promise<Result<User>> {
        console.log('INSIDE CHANGE PROFILE PASSWORD', data);

        try {
            const dto = UserMapperProfile.toChangeProfilePasswordInput(data);

            const user = await this._userRepository.findById(dto.userId);
            if (user.isFailure) return Result.fail(user.getError());

            const otpEntity =
                await this._otpRepository.findRecentOtpByUserIdAndPurpose(
                    dto.userId,
                    OtpPurpose.CHANGE_PROFILE_PASSWORD,
                );

            if (!otpEntity) {
                return Result.fail('Invalid otp');
            }

            if (otpEntity.isOtpExpired()) {
                otpEntity.setOtpStatus(OtpStatus.EXPIRED);
                await this._otpRepository.update(otpEntity.getId(), otpEntity);
                return Result.fail('Otp expired, please request a new otp');
            }

            if (otpEntity.isOtpBlocked()) {
                otpEntity.setOtpStatus(OtpStatus.BLOCKED);
                await this._otpRepository.update(otpEntity.getId(), otpEntity);
                return Result.fail('Otp blocked, please request a new otp');
            }

            if (otpEntity.getOtp() !== data.otp) {
                otpEntity.incrementAttempts();
                await this._otpRepository.update(otpEntity.getId(), otpEntity);
                return Result.fail('Enter correct otp');
            }

            const passwordHash = user
                .getValue()
                .getAuthProvider()
                .getPasswordHash();

            if (passwordHash.isFailure)
                return Result.fail(passwordHash.getError());

            const isPasswordMatch = await this._passwordService.comparePassword(
                dto.oldPassword,
                passwordHash.getValue(),
            );
            if (!isPasswordMatch) return Result.fail('Invalid old password');

            if (dto.oldPassword === dto.newPassword) {
                return Result.fail(
                    'New password cannot be the same as old password',
                );
            }

            const newPasswordHash = await this._passwordService.hashPassword(
                dto.newPassword,
            );
            if (!newPasswordHash)
                return Result.fail('Failed to hash new password');

            user.getValue().setAuthProvider(
                AuthProvider.createLocal(newPasswordHash).getValue(),
            );
            await this._userRepository.save(user.getValue());

            return Result.ok(user.getValue());
        } catch (error) {
            console.log(error);
            return Result.fail(
                'UNEXPECTED ERROR FROM CHANGE PROFILE PASSWORD USECASE',
            );
        }
    }
}

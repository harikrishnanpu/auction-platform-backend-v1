import { ChangePasswordInput } from '@application/dtos/auth/changePassword.dto';
import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { IChangePasswordUsecase } from '@application/interfaces/usecases/auth/IChangePasswordUsecase';
import { TYPES } from '@di/types.di';
import { OtpPurpose, OtpStatus } from '@domain/entities/otp/otp.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { AuthMapperProfile } from '@infrastructure/mappers/auth/auth.mapper';
import { inject, injectable } from 'inversify';
import { AUTH_MESSAGES } from '@presentation/constants/auth/auth.constants';

@injectable()
export class ChangePasswordUsecase implements IChangePasswordUsecase {
    constructor(
        @inject(TYPES.ITokenGeneratorService)
        private readonly _tokenGeneratorService: ITokenGeneratorService,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IPasswordService)
        private readonly _passwordService: IPasswordService,
        @inject(TYPES.IOtpRepository)
        private readonly _otpRepository: IOtpRepository,
    ) {}

    async execute(data: ChangePasswordInput): Promise<Result<null>> {
        const dto = AuthMapperProfile.toChangePasswordInput(data);
        const { token, newPassword } = dto;

        const tokenPayload = this._tokenGeneratorService.verifyToken(token);

        console.log('tokenPayload', tokenPayload);

        if (!tokenPayload) {
            return Result.fail('Invalid token');
        }

        const otpEntity =
            await this._otpRepository.findRecentOtpByUserIdAndPurpose(
                tokenPayload,
                OtpPurpose.RESET_PASSWORD,
            );

        if (!otpEntity) {
            return Result.fail('Invalid token');
        }

        if (otpEntity.isOtpBlocked()) {
            return Result.fail('token blocked');
        }

        if (otpEntity.getOtpStatus() !== OtpStatus.PENDING) {
            return Result.fail('token already verified');
        }

        if (otpEntity.getOtp() !== token) {
            otpEntity.incrementAttempts();
            await this._otpRepository.update(otpEntity.getId(), otpEntity);
            return Result.fail('Invalid token');
        }

        const userEntity = await this._userRepository.findById(tokenPayload);

        if (userEntity.isFailure) {
            return Result.fail(userEntity.getError());
        }

        const user = userEntity.getValue();
        if (user.isBlocked()) {
            return Result.fail(AUTH_MESSAGES.ACCOUNT_BLOCKED);
        }
        if (user.isSuspended()) {
            return Result.fail(AUTH_MESSAGES.ACCOUNT_SUSPENDED);
        }

        const hashedPassword =
            await this._passwordService.hashPassword(newPassword);

        const authProviderVo = AuthProvider.createLocal(hashedPassword);

        if (authProviderVo.isFailure) {
            return Result.fail(authProviderVo.getError());
        }

        userEntity.getValue().setAuthProvider(authProviderVo.getValue());

        otpEntity.setOtpStatus(OtpStatus.VERIFIED);
        await this._otpRepository.update(otpEntity.getId(), otpEntity);
        await this._userRepository.save(userEntity.getValue());

        return Result.ok(null);
    }
}

import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import {
  EditProfileInput,
  EditProfileOutput,
} from '@application/dtos/user/editProfile.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { IEditProfileUsecase } from '@application/interfaces/usecases/user/IEditProfileUsecase';
import { TYPES } from '@di/types.di';
import { OtpPurpose } from '@domain/entities/otp/otp.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
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
  ) {}

  async execute(data: EditProfileInput): Promise<Result<EditProfileOutput>> {
    try {
      const userEntity = await this._userRepository.findById(data.userId);
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

      if (otpEntity.getOtp() !== data.otp) {
        otpEntity.incrementAttempts();
        await this._otpRepository.update(otpEntity);
        return Result.fail('Invalid otp');
      }

      const emailVo = Email.create(data.email);
      if (emailVo.isFailure) {
        return Result.fail(emailVo.getError());
      }

      const phoneVo = Phone.create(data.phone);
      if (phoneVo.isFailure) {
        return Result.fail(phoneVo.getError());
      }

      userEntity.getValue().setName(data.name);
      userEntity.getValue().setEmail(emailVo.getValue());
      userEntity.getValue().setPhone(phoneVo.getValue());
      userEntity.getValue().setAddress(data.address);

      await this._userRepository.save(userEntity.getValue());

      const userResponseDto: userResponseDto = {
        id: userEntity.getValue().getId(),
        name: userEntity.getValue().getName(),
        email: userEntity.getValue().getEmail().getValue(),
        phone: userEntity.getValue().getPhone()?.getValue() ?? '',
        address: userEntity.getValue().getAddress() ?? '',
        avatar_url: userEntity.getValue().getAvatarUrl() ?? '',
        isProfileCompleted: userEntity.getValue().isProfileCompleted(),
        isVerified: userEntity.getValue().getIsVerified(),
        status: userEntity.getValue().getStatus(),
        authProvider: userEntity.getValue().getAuthProvider().getType(),
        roles: userEntity
          .getValue()
          .getRoles()
          .map((role) => role.getValue() as UserRoleType),
      };

      return Result.ok({
        user: userResponseDto,
      });
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM EDIT PROFILE USECASE');
    }
  }
}

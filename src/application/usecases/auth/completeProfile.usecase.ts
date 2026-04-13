import { CompleteProfileOutput } from '@application/dtos/auth/completeProfile.dto';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { ICompleteProfileUsecase } from '@application/interfaces/usecases/auth/ICompleteProfileUsecase';
import { TYPES } from '@di/types.di';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { Phone } from '@domain/value-objects/phone.vo';
import { AuthMapperProfile } from '@infrastructure/mappers/auth/auth.mapper';
import { ZodCompleteProfileInputType } from '@presentation/validators/schemas/auth/completeProfile.schema';
import { inject, injectable } from 'inversify';

@injectable()
export class CompleteProfileUsecase implements ICompleteProfileUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
    ) {}

    async execute(
        data: ZodCompleteProfileInputType,
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
    }
}

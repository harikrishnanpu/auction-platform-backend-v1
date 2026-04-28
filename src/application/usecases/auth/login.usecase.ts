import {
    LoginUserInput,
    LoginUserOutput,
    userResponseDto,
} from '@application/dtos/auth/loginUser.dto';
import { UserRoleType } from '@application/dtos/auth/userRole.dto';
import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { ILoginUseCase } from '@application/interfaces/usecases/auth/ILoginUsecase';
import { TYPES } from '@di/types.di';
import {
    AuthProviderType,
    UserStatus,
} from '@domain/entities/user/user.entity';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { Email } from '@domain/value-objects/email.vo';
import { AuthMapperProfile } from '@infrastructure/mappers/auth/auth.mapper';
import { inject, injectable } from 'inversify';

@injectable()
export class LoginUseCase implements ILoginUseCase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IPasswordService)
        private readonly _passwordService: IPasswordService,
        @inject(TYPES.ITokenGeneratorService)
        private readonly _tokenGeneratorService: ITokenGeneratorService,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(data: LoginUserInput): Promise<Result<LoginUserOutput>> {
        try {
            const dto = AuthMapperProfile.toLoginUserInput(data);
            const { email, password } = dto;

            const emailVo = Email.create(email);
            if (emailVo.isFailure) {
                return Result.fail('Invalid email');
            }

            const userEntity = await this._userRepository.findByEmail(
                emailVo.getValue(),
            );

            if (userEntity.isFailure) {
                return Result.fail(userEntity.getError());
            }

            if (
                userEntity.getValue().getAuthProvider().getType() !==
                AuthProviderType.LOCAL
            ) {
                return Result.fail('Invalid auth provider');
            }

            const passwordHash = userEntity
                .getValue()
                .getAuthProvider()
                .getPasswordHash();
            if (passwordHash.isFailure) {
                return Result.fail(passwordHash.getError());
            }

            console.log(passwordHash.getValue());

            const passwordMatch = await this._passwordService.comparePassword(
                password,
                passwordHash.getValue(),
            );

            if (!passwordMatch) {
                return Result.fail('Invalid password');
            }

            const user = userEntity.getValue();
            if (user.getStatus() === UserStatus.BLOCKED) {
                return Result.fail(
                    'Your account has been blocked. Please contact support for assistance.',
                );
            }

            const accessToken = this._tokenGeneratorService.generateAccessToken(
                user.getId(),
            );
            const refreshToken =
                this._tokenGeneratorService.generateRefreshToken(user.getId());

            const subRes = await this._userSubscriptionRepository.getByUserId(
                user.getId(),
            );
            if (subRes.isFailure) {
                return Result.fail(subRes.getError());
            }
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
                accessToken,
                refreshToken,
            });
        } catch (error) {
            console.log(error);
            return Result.fail('UNEXPECTED ERROR FROM LOGIN USECASE');
        }
    }
}

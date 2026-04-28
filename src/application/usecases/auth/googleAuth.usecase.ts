import { GoogleUserDto } from '@application/dtos/auth/googleUser.dto';
import { UserRoleType } from '@application/dtos/auth/userRole.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { IGoogleAuthUsecase } from '@application/interfaces/usecases/auth/IGoogleAuthUsecase';
import { IAssignDefaultSubscriptionToUserUsecase } from '@application/interfaces/usecases/subscription/IAssignDefaultSubscriptionToUserUsecase';
import { TYPES } from '@di/types.di';
import {
    AuthProviderType,
    User,
    UserStatus,
} from '@domain/entities/user/user.entity';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { Email } from '@domain/value-objects/email.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class GoogleAuthUsecase implements IGoogleAuthUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.ITokenGeneratorService)
        private readonly _tokenGenerator: ITokenGeneratorService,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IAssignDefaultSubscriptionToUserUsecase)
        private readonly _assignDefaultSubscriptionToUserUsecase: IAssignDefaultSubscriptionToUserUsecase,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(
        data: GoogleUserDto,
    ): Promise<
        Result<{
            user: userResponseDto;
            accessToken: string;
            refreshToken: string;
        }>
    > {
        const emailVo = Email.create(data.email);
        if (emailVo.isFailure) {
            return Result.fail(emailVo.getError());
        }

        const userEntity = await this._userRepository.findByEmail(
            emailVo.getValue(),
        );

        if (userEntity.isSuccess) {
            const user = userEntity.getValue();

            if (user.getStatus() === UserStatus.BLOCKED) {
                return Result.fail(
                    'Your account has been blocked. Please contact support for assistance.',
                );
            }

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

            const accessToken = this._tokenGenerator.generateAccessToken(
                user.getId(),
            );
            const refreshToken = this._tokenGenerator.generateRefreshToken(
                user.getId(),
            );

            return Result.ok({
                user: userDto,
                accessToken,
                refreshToken,
            });
        }

        const userId = this._idGeneratingService.generateId();

        const authProviderVo = AuthProvider.createOAuth(
            AuthProviderType.GOOGLE,
            data.googleId,
        );

        const newUserEntity = User.create({
            id: userId,
            name: data.name,
            email: emailVo.getValue(),
            authProvider: authProviderVo,
            roles: [UserRole.USER],
            isVerified: false,
            avatar_url: data.avatar,
            address: null,
            status: UserStatus.ACTIVE,
        });

        if (newUserEntity.isFailure) {
            return Result.fail(newUserEntity.getError());
        }

        await this._userRepository.save(newUserEntity.getValue());

        const assignSub =
            await this._assignDefaultSubscriptionToUserUsecase.execute(userId);
        if (assignSub.isFailure) {
            console.error(
                'Assign default subscription failed',
                assignSub.getError(),
            );
        }

        const accessToken = this._tokenGenerator.generateAccessToken(
            newUserEntity.getValue().getId(),
        );
        const refreshToken = this._tokenGenerator.generateRefreshToken(
            newUserEntity.getValue().getId(),
        );

        const createdUser = newUserEntity.getValue();
        const subRes = await this._userSubscriptionRepository.getByUserId(
            createdUser.getId(),
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
            id: createdUser.getId(),
            name: createdUser.getName(),
            email: createdUser.getEmail().getValue(),
            phone: createdUser.getPhone()?.getValue() ?? '',
            address: createdUser.getAddress() ?? '',
            avatar_url: createdUser.getAvatarUrl() ?? '',
            isProfileCompleted: createdUser.isProfileCompleted(),
            isVerified: createdUser.getIsVerified(),
            status: createdUser.getStatus(),
            authProvider: createdUser.getAuthProvider().getType(),
            roles: createdUser
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
    }
}

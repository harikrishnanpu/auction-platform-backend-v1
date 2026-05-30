import { GoogleUserDto } from '@application/dtos/auth/googleUser.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { IGoogleAuthUsecase } from '@application/interfaces/usecases/auth/IGoogleAuthUsecase';
import { ISubscriptionService } from '@application/interfaces/services/ISubscriptionService';
import { TYPES } from '@di/types.di';
import {
    AuthProviderType,
    User,
    UserStatus,
} from '@domain/entities/user/user.entity';
import { AUTH_MESSAGES } from '@presentation/constants/auth/auth.constants';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { Result } from '@domain/shared/result';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { Email } from '@domain/value-objects/email.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';
import { inject, injectable } from 'inversify';
import { UserMapperProfile } from '@application/mappers/user/user.mapper';

@injectable()
export class GoogleAuthUsecase implements IGoogleAuthUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.ITokenGeneratorService)
        private readonly _tokenGenerator: ITokenGeneratorService,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.ISubscriptionService)
        private readonly _subscriptionService: ISubscriptionService,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(data: GoogleUserDto): Promise<
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

            if (user.isBlocked()) {
                return Result.fail(AUTH_MESSAGES.ACCOUNT_BLOCKED);
            }
            if (user.isSuspended()) {
                return Result.fail(AUTH_MESSAGES.ACCOUNT_SUSPENDED);
            }

            const accessToken = this._tokenGenerator.generateAccessToken(
                user.getId(),
            );
            const refreshToken = this._tokenGenerator.generateRefreshToken(
                user.getId(),
            );

            const assignSub =
                await this._subscriptionService.assignDefaultSubscriptionToUser(
                    user.getId(),
                );
            if (assignSub.isFailure) {
                return Result.fail(assignSub.getError());
            }

            const currentUserSubscriptionEntity =
                await this._userSubscriptionRepository.findCurrentActiveByUserId(
                    user.getId(),
                );
            if (currentUserSubscriptionEntity.isFailure) {
                return Result.fail(currentUserSubscriptionEntity.getError());
            }

            const currUserSubcptionEntity =
                currentUserSubscriptionEntity.getValue();
            if (!currUserSubcptionEntity) {
                const result = UserMapperProfile.toUserResponseDto(
                    user,
                    null,
                    null,
                );
                return Result.ok({
                    user: result,
                    accessToken,
                    refreshToken,
                });
            }

            const subscription =
                await this._subscriptionPlanRepository.findById(
                    currUserSubcptionEntity.getSubscriptionPlanId(),
                );
            if (subscription.isFailure) {
                return Result.fail(subscription.getError());
            }
            const subscriptionEntity = subscription.getValue();

            const result = UserMapperProfile.toUserResponseDto(
                user,
                currUserSubcptionEntity,
                subscriptionEntity,
            );

            return Result.ok({
                user: result,
                accessToken,
                refreshToken,
            });
        }

        const userId = this._idGeneratingService.generateId();

        const authProviderResult = AuthProvider.createOAuth(
            AuthProviderType.GOOGLE,
            data.googleId,
        );
        if (authProviderResult.isFailure) {
            return Result.fail(authProviderResult.getError());
        }
        const authProviderVo = authProviderResult.getValue();

        const newUserEntity = User.create({
            id: userId,
            name: data.name,
            email: emailVo.getValue(),
            authProvider: authProviderVo,
            roles: [UserRole.USER],
            isVerified: true,
            avatar_url: data.avatar,
            address: null,
            status: UserStatus.ACTIVE,
        });

        if (newUserEntity.isFailure) {
            return Result.fail(newUserEntity.getError());
        }

        await this._userRepository.save(newUserEntity.getValue());

        const assignSub =
            await this._subscriptionService.assignDefaultSubscriptionToUser(
                userId,
            );

        if (assignSub.isFailure) {
            console.log(
                'assign default subscription failed',
                assignSub.getError(),
            );
            return Result.fail(assignSub.getError());
        }

        const accessToken = this._tokenGenerator.generateAccessToken(
            newUserEntity.getValue().getId(),
        );
        const refreshToken = this._tokenGenerator.generateRefreshToken(
            newUserEntity.getValue().getId(),
        );

        const createdUser = newUserEntity.getValue();

        const currentUserSubscriptionEntity =
            await this._userSubscriptionRepository.findCurrentActiveByUserId(
                createdUser.getId(),
            );
        if (currentUserSubscriptionEntity.isFailure) {
            return Result.fail(currentUserSubscriptionEntity.getError());
        }

        const currUserSubcptionEntity =
            currentUserSubscriptionEntity.getValue();

        if (!currUserSubcptionEntity) {
            const result = UserMapperProfile.toUserResponseDto(
                createdUser,
                null,
                null,
            );
            return Result.ok({
                user: result,
                accessToken,
                refreshToken,
            });
        }

        const subscription = await this._subscriptionPlanRepository.findById(
            currUserSubcptionEntity.getSubscriptionPlanId(),
        );
        if (subscription.isFailure) {
            return Result.fail(subscription.getError());
        }
        const subscriptionEntity = subscription.getValue();

        const result = UserMapperProfile.toUserResponseDto(
            createdUser,
            currUserSubcptionEntity,
            subscriptionEntity,
        );

        return Result.ok({
            user: result,
            accessToken,
            refreshToken,
        });
    }
}

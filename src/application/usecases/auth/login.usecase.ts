import {
    LoginUserInput,
    LoginUserOutput,
} from '@application/dtos/auth/loginUser.dto';
import { IPasswordService } from '@application/interfaces/services/IPasswordService';
import { ISubscriptionService } from '@application/interfaces/services/ISubscriptionService';
import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { ILoginUseCase } from '@application/interfaces/usecases/auth/ILoginUsecase';
import { UserMapperProfile } from '@application/mappers/user/user.mapper';
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
        @inject(TYPES.ISubscriptionService)
        private readonly _subscriptionService: ISubscriptionService,
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

            const currentUserSubscriptionEntity =
                await this._userSubscriptionRepository.findCurrentActiveByUserId(
                    user.getId(),
                );
            if (currentUserSubscriptionEntity.isFailure) {
                return Result.fail(currentUserSubscriptionEntity.getError());
            }

            // --change ---===
            const assignSub =
                await this._subscriptionService.assignDefaultSubscriptionToUser(
                    user.getId(),
                );
            if (assignSub.isFailure) {
                return Result.fail(assignSub.getError());
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
        } catch (error) {
            console.log(error);
            return Result.fail('UNEXPECTED ERROR FROM LOGIN USECASE');
        }
    }
}

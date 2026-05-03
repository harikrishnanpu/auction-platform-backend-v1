import { TYPES } from '@di/types.di';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { AppError } from '@presentation/http/error/app.error';
import { IChangeProfilePasswordUsecase } from '@application/interfaces/usecases/user/IChangeProfilePassword';
import {
    changeProfilePasswordSchema,
    ZodChangeProfilePasswordInputType,
} from '@presentation/validators/schemas/user/change-profile-password.schema';
import { USER_PROFILE_CONSTANTS } from '@presentation/constants/user/user-profile.constants';
import { ISendOtpUsecase } from '@application/interfaces/usecases/otp/ISendOtpUsecase';
import { SendVerificationCodeInputDto } from '@application/dtos/otp/SendOtp.dto';
import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';
import { EditProfileOutput } from '@application/dtos/user/editProfile.dto';
import { IEditProfileUsecase } from '@application/interfaces/usecases/user/IEditProfileUsecase';
import {
    editProfileSchema,
    ZodEditProfileInputType,
} from '@presentation/validators/schemas/user/editProfile.schema';
import { IGenerateAvatarUploadUrlUsecase } from '@application/interfaces/usecases/user/IGenerateAvatarUploadUrlUsecase';
import {
    generateUploadUrlSchema,
    ZodGenerateUploadUrlInputType,
} from '@presentation/validators/schemas/user/generate-upload-url.schema';
import {
    updateAvatarUrlSchema,
    ZodUpdateAvatarUrlInputType,
} from '@presentation/validators/schemas/user/update-avatar-url.schema';
import { UpdateAvatarUrlResponseDto } from '@application/dtos/user/updateAvatar.dto';
import { IUpdateAvatarUrlUsecase } from '@application/interfaces/usecases/user/IUpdateAvatarUrl';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import { IGetUserNotificationsUsecase } from '@application/interfaces/usecases/notification/IGetUserNotificationsUsecase';
import { IGetUserParticipatedAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetUserParticipatedAuctionsUsecase';
import { IGetOrCreateWalletUsecase } from '@application/interfaces/usecases/wallet/IGetOrCreateWalletUsecase';
import { IGetUserHomeStatsUsecase } from '@application/interfaces/usecases/user/IGetUserHomeStatsUsecase';
import { IGetPublicSubscriptionPlansUsecase } from '@application/interfaces/usecases/subscription/IGetPublicSubscriptionPlansUsecase';
import { ICheckoutUserSubscriptionUsecase } from '@application/interfaces/usecases/subscription/ICheckoutUserSubscription';
import { StartSubscriptionCheckoutOutputDto } from '@application/dtos/user/startSubscriptionCheckout.dto';
import { IGetUserHomeStatsOutputDto } from '@application/dtos/user/getUserHomeStats.dto';
import {
    ZodGetUserParticipatedAuctionsInputType,
    ZodGetUserParticipatedAuctionsSchema,
} from '@presentation/validators/schemas/auction/getUserParticipatedAuctionsInput.schema';
import {
    startSubscriptionCheckoutSchema,
    ZodStartSubscriptionCheckoutInputType,
} from '@presentation/validators/schemas/user/startSubscriptionCheckout.schema';
import { IPublicSubscriptionPlaDto } from '@application/dtos/user/publicSubscriptionPlan.dto';

@injectable()
export class UserController {
    constructor(
        @inject(TYPES.IChangeProfilePasswordUsecase)
        private readonly _changeProfilePasswordUseCase: IChangeProfilePasswordUsecase,
        @inject(TYPES.ISendOtpUsecase)
        private readonly _sendOtpUseCase: ISendOtpUsecase,
        @inject(TYPES.IEditProfileUsecase)
        private readonly _editProfileUseCase: IEditProfileUsecase,
        @inject(TYPES.IGenerateAvatarUploadUrlUsecase)
        private readonly _generateAvatarUploadUrlUseCase: IGenerateAvatarUploadUrlUsecase,
        @inject(TYPES.IUpdateAvatarUrlUsecase)
        private readonly _updateAvatarUrlUseCase: IUpdateAvatarUrlUsecase,
        @inject(TYPES.IGetUserNotificationsUsecase)
        private readonly _getUserNotificationsUsecase: IGetUserNotificationsUsecase,
        @inject(TYPES.IGetUserParticipatedAuctionsUsecase)
        private readonly _getUserParticipatedAuctionsUsecase: IGetUserParticipatedAuctionsUsecase,
        @inject(TYPES.IGetOrCreateWalletUsecase)
        private readonly _getOrCreateWalletUsecase: IGetOrCreateWalletUsecase,
        @inject(TYPES.IGetUserHomeStatsUsecase)
        private readonly _getUserHomeStatsUsecase: IGetUserHomeStatsUsecase,
        @inject(TYPES.IGetPublicSubscriptionPlansUsecase)
        private readonly _getPublicSubscriptionPlansUsecase: IGetPublicSubscriptionPlansUsecase,
        @inject(TYPES.IStartUserSubscriptionCheckoutUsecase)
        private readonly _startUserSubscriptionCheckoutUsecase: ICheckoutUserSubscriptionUsecase,
    ) {}

    /**
     * @description Get home-page stats for the current user
     * @returns ApiResponse<IGetUserHomeStatsOutputDto>
     */
    getHomeStats = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const result = await this._getUserHomeStatsUsecase.execute({
            userId: req.user.id,
        });

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<IGetUserHomeStatsOutputDto>(
            res,
            result.getValue(),
            USER_PROFILE_CONSTANTS.MESSAGES.GET_HOME_STATS_SUCCESSFULLY,
            USER_PROFILE_CONSTANTS.CODES.OK,
        );
    });

    /**
     * @description Send a profile change password otp to the user's email
     * @returns ApiResponse<null>
     */

    sendProfileChangePasswordOtp = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const sendOtpInput: SendVerificationCodeInputDto = {
                email: req.user.email,
                purpose: OtpPurpose.CHANGE_PROFILE_PASSWORD,
                channel: OtpChannel.EMAIL,
            };

            const result = await this._sendOtpUseCase.execute(sendOtpInput);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<null>(
                res,
                null,
                USER_PROFILE_CONSTANTS.MESSAGES
                    .PROFILE_CHANGE_PASSWORD_EMAIL_SENT_SUCCESSFULLY,
                USER_PROFILE_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * @description Change the user's profile password
     * @returns ApiResponse<null>
     */

    changeProfilePassword = expressAsyncHandler(
        async (req: Request, res: Response) => {
            // console.log(req.body);
            if (!req.user) {
                throw new AppError(
                    USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodChangeProfilePasswordInputType>(
                    changeProfilePasswordSchema,
                    {
                        ...req.body,
                        userId: req.user.id,
                    },
                );

            const user =
                await this._changeProfilePasswordUseCase.execute(
                    validationResult,
                );

            if (user.isFailure) {
                throw new AppError(
                    user.getError(),
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<null>(
                res,
                null,
                USER_PROFILE_CONSTANTS.MESSAGES
                    .CHANGE_PROFILE_PASSWORD_SUCCESSFULLY,
                USER_PROFILE_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * @description Send a edit profile otp to the user's email
     * @returns ApiResponse<null>
     */

    editProfileSendOtp = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const sendOtpInput: SendVerificationCodeInputDto = {
                email: req.user.email,
                purpose: OtpPurpose.EDIT_PROFILE,
                channel: OtpChannel.EMAIL,
            };

            const result = await this._sendOtpUseCase.execute(sendOtpInput);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<null>(
                res,
                null,
                USER_PROFILE_CONSTANTS.MESSAGES
                    .EDIT_PROFILE_SEND_OTP_SUCCESSFULLY,
                USER_PROFILE_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * @description Edit the user's profile
     * @returns ApiResponse<EditProfileOutput>
     */

    editProfile = expressAsyncHandler(async (req: Request, res: Response) => {
        // console.log('EDIT PROFILE=---', req.body);

        if (!req.user) {
            throw new AppError(
                USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const validationResult =
            ValidationHelper.validate<ZodEditProfileInputType>(
                editProfileSchema,
                {
                    ...req.body,
                    userId: req.user.id,
                    email: req.user.email,
                },
            );

        const result = await this._editProfileUseCase.execute(validationResult);

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<EditProfileOutput>(
            res,
            result.getValue(),
            USER_PROFILE_CONSTANTS.MESSAGES.EDIT_PROFILE_SUCCESSFULLY,
            USER_PROFILE_CONSTANTS.CODES.OK,
        );
    });

    generateAvatarUploadUrl = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodGenerateUploadUrlInputType>(
                    generateUploadUrlSchema,
                    {
                        ...req.body,
                        userId: req.user.id,
                    },
                );

            const result =
                await this._generateAvatarUploadUrlUseCase.execute(
                    validationResult,
                );

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success(
                res,
                result.getValue(),
                USER_PROFILE_CONSTANTS.MESSAGES
                    .GENERATE_AVATAR_UPLOAD_URL_SUCCESSFULLY,
                USER_PROFILE_CONSTANTS.CODES.OK,
            );
        },
    );

    updateAvatarUrl = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodUpdateAvatarUrlInputType>(
                    updateAvatarUrlSchema,
                    {
                        ...req.body,
                        userId: req.user.id,
                    },
                );

            const result =
                await this._updateAvatarUrlUseCase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<UpdateAvatarUrlResponseDto>(
                res,
                result.getValue(),
                USER_PROFILE_CONSTANTS.MESSAGES.UPDATE_AVATAR_URL_SUCCESSFULLY,
                USER_PROFILE_CONSTANTS.CODES.OK,
            );
        },
    );

    getNotifications = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const pageRaw = req.query.page;
            const limitRaw = req.query.limit;

            const page = Number(pageRaw);
            const limit = Number(limitRaw);

            const result = await this._getUserNotificationsUsecase.execute({
                userId: req.user.id,
                page,
                limit,
            });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success(
                res,
                result.getValue(),
                USER_PROFILE_CONSTANTS.MESSAGES.GET_NOTIFICATIONS_SUCCESSFULLY,
                USER_PROFILE_CONSTANTS.CODES.OK,
            );
        },
    );

    getMyAuctions = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const validatedResult =
            ValidationHelper.validate<ZodGetUserParticipatedAuctionsInputType>(
                ZodGetUserParticipatedAuctionsSchema,
                {
                    userId: req.user.id,
                    ...req.query,
                } as ZodGetUserParticipatedAuctionsInputType,
            );

        const result =
            await this._getUserParticipatedAuctionsUsecase.execute(
                validatedResult,
            );

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success(
            res,
            result.getValue(),
            USER_PROFILE_CONSTANTS.MESSAGES.GET_MY_AUCTIONS_SUCCESSFULLY,
            USER_PROFILE_CONSTANTS.CODES.OK,
        );
    });

    getSubscriptionPlans = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const result =
                await this._getPublicSubscriptionPlansUsecase.execute(
                    req.user.id,
                );
            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<IPublicSubscriptionPlaDto[]>(
                res,
                result.getValue(),
                USER_PROFILE_CONSTANTS.MESSAGES
                    .GET_SUBSCRIPTION_PLANS_SUCCESSFULLY,
                USER_PROFILE_CONSTANTS.CODES.OK,
            );
        },
    );

    startSubscriptionCheckout = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const body =
                ValidationHelper.validate<ZodStartSubscriptionCheckoutInputType>(
                    startSubscriptionCheckoutSchema,
                    req.body,
                );

            const result =
                await this._startUserSubscriptionCheckoutUsecase.execute({
                    userId: req.user.id,
                    subscriptionPlanId: body.subscriptionPlanId,
                });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<StartSubscriptionCheckoutOutputDto>(
                res,
                result.getValue(),
                USER_PROFILE_CONSTANTS.MESSAGES
                    .START_SUBSCRIPTION_CHECKOUT_SUCCESSFULLY,
                USER_PROFILE_CONSTANTS.CODES.OK,
            );
        },
    );

    getWallet = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const result = await this._getOrCreateWalletUsecase.execute({
            userId: req.user.id,
        });

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success(
            res,
            result.getValue(),
            USER_PROFILE_CONSTANTS.MESSAGES.GET_WALLET_SUCCESSFULLY,
            USER_PROFILE_CONSTANTS.CODES.OK,
        );
    });

    streamNotifications = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    USER_PROFILE_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    USER_PROFILE_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');

            res.flushHeaders();

            const userId = req.user.id;

            const pushNotifications = async () => {
                const streamPayloadResult =
                    await this._getUserNotificationsUsecase.getStreamPayload(
                        userId,
                    );

                if (streamPayloadResult.isFailure) {
                    res.write(
                        `event: error\ndata: ${JSON.stringify({
                            message: streamPayloadResult.getError(),
                        })}\n\n`,
                    );
                    return;
                }

                res.write(
                    `data: ${JSON.stringify(streamPayloadResult.getValue())}\n\n`,
                );
            };

            await pushNotifications();

            const interval = setInterval(() => {
                void pushNotifications();
            }, 5000);

            const heartbeat = setInterval(() => {
                res.write(': ping\n\n');
            }, 15000);

            req.on('close', () => {
                clearInterval(interval);
                clearInterval(heartbeat);
                res.end();
            });
        },
    );
}

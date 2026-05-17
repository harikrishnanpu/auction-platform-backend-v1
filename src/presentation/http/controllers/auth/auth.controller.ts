import { IRegisterUseCase } from '@application/interfaces/usecases/auth/IRegisterUsecase';
import {
    AUTH_CONSTANTS,
    AUTH_MESSAGES,
} from '@presentation/constants/auth/auth.constants';
import { TYPES } from '@di/types.di';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { AppError } from '@presentation/http/error/app.error';
import expressAsyncHandler from 'express-async-handler';
import {
    ZodRegisterInputType,
    registerSchema,
} from '@presentation/validators/schemas/auth/register.schema';
import {
    sendVerificationCodeSchema,
    ZodSendVerificationCodeInputType,
} from '@presentation/validators/schemas/auth/sendVerificationCode.schema';
import {
    verifyCredentialsSchema,
    ZodVerifyCredentialsInputType,
} from '@presentation/validators/schemas/auth/verifyCredentials.schema';
import { IVerifyCredentialsUseCase } from '@application/interfaces/usecases/auth/IVerifyCredentialsUseCase';
import { ILoginUseCase } from '@application/interfaces/usecases/auth/ILoginUsecase';
import {
    loginSchema,
    ZodLoginInputType,
} from '@presentation/validators/schemas/auth/login.schema';
import { IGetUserUsecase } from '@application/interfaces/usecases/auth/IGetUserUsecase';
import passport, { Profile } from 'passport';
import { IGoogleAuthUsecase } from '@application/interfaces/usecases/auth/IGoogleAuthUsecase';
import { GoogleUserDto } from '@application/dtos/auth/googleUser.dto';
import {
    completeProfileSchema,
    ZodCompleteProfileInputType,
} from '@presentation/validators/schemas/auth/completeProfile.schema';
import { ICompleteProfileUsecase } from '@application/interfaces/usecases/auth/ICompleteProfileUsecase';
import { CompleteProfileOutput } from '@application/dtos/auth/completeProfile.dto';
import {
    forgottenPasswordSchema,
    ZodForgottenPasswordInputType,
} from '@presentation/validators/schemas/auth/forgottenPassword.schema';
import { IForgotPasswordUsecase } from '@application/interfaces/usecases/auth/IForgotPasswordUsecase';
import { IChangePasswordUsecase } from '@application/interfaces/usecases/auth/IChangePasswordUsecase';
import {
    changePasswordSchema,
    ZodChangePasswordInputType,
} from '@presentation/validators/schemas/auth/changePassword.schema';
import { JWT_CONSTANTS } from '@presentation/constants/jwt/jwt.constants';
import { ISendOtpUsecase } from '@application/interfaces/usecases/otp/ISendOtpUsecase';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { verifyCredentialsOutput } from '@application/dtos/auth/verifyCredentials.dto';
import { RegisterUserOutputDto } from '@application/dtos/auth/registerUser.dto';
import { LoginUserOutput } from '@application/dtos/auth/loginUser.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import { OtpChannel } from '@domain/entities/otp/otp.entity';

@injectable()
export class AuthController {
    constructor(
        @inject(TYPES.IRegisterUseCase)
        private readonly _registerUseCase: IRegisterUseCase,
        @inject(TYPES.ISendOtpUsecase)
        private readonly _sendOtpUsecase: ISendOtpUsecase,
        @inject(TYPES.IVerifyCredentialsUseCase)
        private readonly _verifyCredentialsUseCase: IVerifyCredentialsUseCase,
        @inject(TYPES.ILoginUseCase)
        private readonly _loginUseCase: ILoginUseCase,
        @inject(TYPES.IGetUserUsecase)
        private readonly _getUserUseCase: IGetUserUsecase,
        @inject(TYPES.IGoogleAuthUsecase)
        private readonly _googleAuthUseCase: IGoogleAuthUsecase,
        @inject(TYPES.ICompleteProfileUsecase)
        private readonly _completeProfileUseCase: ICompleteProfileUsecase,
        @inject(TYPES.IForgotPasswordUsecase)
        private readonly _forgotPasswordUseCase: IForgotPasswordUsecase,
        @inject(TYPES.IChangePasswordUsecase)
        private readonly _changePasswordUseCase: IChangePasswordUsecase,
    ) {}

    /**
     * Registers a new user with validated registration fields from the body.
     *
     * @param req - Express request; `body` validated with `registerSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after the success payload is sent (201)
     * @throws {AppError} When validation fails or the register use case returns failure
     */
    register = expressAsyncHandler(async (req: Request, res: Response) => {
        const validationResult =
            ValidationHelper.validate<ZodRegisterInputType>(
                registerSchema,
                req.body,
            );

        const result = await this._registerUseCase.execute(validationResult);

        if (result.isFailure) {
            console.log('error');
            throw new AppError(
                result.getError(),
                AUTH_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<RegisterUserOutputDto>(
            res,
            result.getValue(),
            AUTH_CONSTANTS.MESSAGES.USER_REGISTERED_SUCCESSFULLY,
            AUTH_CONSTANTS.CODES.CREATED,
        );
    });

    /**
     * Sends a one-time verification code to the user's email (OTP channel forced to email).
     *
     * @param req - Express request; `body` validated with `sendVerificationCodeSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after the success response is sent
     * @throws {AppError} When validation fails or OTP dispatch fails
     */
    sendVerificationCode = expressAsyncHandler(
        async (req: Request, res: Response) => {
            console.log(req.body);

            const validationResult =
                ValidationHelper.validate<ZodSendVerificationCodeInputType>(
                    sendVerificationCodeSchema,
                    {
                        ...req.body,
                        channel: OtpChannel.EMAIL,
                    },
                );

            const result = await this._sendOtpUsecase.execute(validationResult);

            if (result.isFailure) {
                console.log('error');
                throw new AppError(
                    result.getError(),
                    AUTH_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<null>(
                res,
                null,
                AUTH_CONSTANTS.MESSAGES.VERIFICATION_CODE_SENT_SUCCESSFULLY,
                AUTH_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Verifies email / OTP credentials so the account can proceed past onboarding gates.
     *
     * @param req - Express request; `body` validated with `verifyCredentialsSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after credentials output is sent
     * @throws {AppError} When validation fails or verification fails
     */
    verifyCredentials = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodVerifyCredentialsInputType>(
                    verifyCredentialsSchema,
                    req.body,
                );

            // console.log(validationResult.error?.format());

            const result =
                await this._verifyCredentialsUseCase.execute(validationResult);

            if (result.isFailure) {
                console.log('error');
                throw new AppError(
                    result.getError(),
                    AUTH_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const { accessToken, refreshToken } = result.getValue();

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                domain: process.env.FRONTEND_HOST,
                maxAge: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRY,
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                domain: process.env.FRONTEND_HOST,
                maxAge: JWT_CONSTANTS.REFRESH_TOKEN_EXPIRY,
            });

            ResponseHelper.success<verifyCredentialsOutput>(
                res,
                result.getValue(),
                AUTH_CONSTANTS.MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
                AUTH_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Logs a user in with email and password and returns access/refresh tokens in the JSON body.
     *
     * @param req - Express request; `body` validated with `loginSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after login payload is sent
     * @throws {AppError} When validation fails or credentials are invalid
     */
    login = expressAsyncHandler(async (req: Request, res: Response) => {
        const validationResult = ValidationHelper.validate<ZodLoginInputType>(
            loginSchema,
            req.body,
        );

        const result = await this._loginUseCase.execute(validationResult);

        if (result.isFailure) {
            console.log('error');
            throw new AppError(
                result.getError(),
                AUTH_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const { accessToken, refreshToken } = result.getValue();

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: process.env.FRONTEND_HOST,
            maxAge: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRY,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            domain: process.env.FRONTEND_HOST,
            maxAge: JWT_CONSTANTS.REFRESH_TOKEN_EXPIRY,
        });

        ResponseHelper.success<LoginUserOutput>(
            res,
            result.getValue(),
            AUTH_CONSTANTS.MESSAGES.LOGIN_SUCCESSFULLY,
            AUTH_CONSTANTS.CODES.OK,
        );
    });

    /**
     * Returns the current user's profile using `req.user.id` from auth middleware.
     *
     * @param req - Express request including `user` set by auth middleware
     * @param res - Express response for JSON output
     * @returns Promise that settles after the user DTO is sent
     * @throws {AppError} When `req.user` is missing or the lookup use case fails
     */
    getUser = expressAsyncHandler(async (req: Request, res: Response) => {
        console.log('getUser controller called');

        if (!req.user) {
            throw new AppError(
                AUTH_MESSAGES.USER_NOT_FOUND,
                AUTH_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const userId = req.user.id;

        const result = await this._getUserUseCase.execute(userId);

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                AUTH_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<userResponseDto>(
            res,
            result.getValue(),
            AUTH_CONSTANTS.MESSAGES.USER_FETCHED_SUCCESSFULLY,
            AUTH_CONSTANTS.CODES.OK,
        );
    });

    /**
     * Starts Google OAuth2: redirects the browser to Google (Passport, session disabled).
     *
     * @param req - Express request passed through to Passport
     * @param res - Express response passed through to Passport
     * @param next - Express `next` used by Passport middleware
     * @returns Promise that settles when Passport hands off to Google
     */
    googleAuth = expressAsyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            passport.authenticate('google', {
                scope: ['profile', 'email'],
                session: false,
            })(req, res, next);
        },
    );

    /**
     * Google OAuth callback: issues app tokens, sets HTTP-only cookies, redirects into the SPA.
     *
     * @param req - Express request carrying Google callback parameters
     * @param res - Express response used for cookies and redirects (no JSON envelope on success)
     * @returns Promise that settles after redirect or error redirect
     */
    googleAuthCallback = expressAsyncHandler(
        async (req: Request, res: Response) => {
            passport.authenticate(
                'google',
                { session: false },
                async (err: unknown, user: Profile) => {
                    if (err || !user) {
                        return res.redirect(
                            `${process.env.FRONTEND_URL}/login?error=Google authentication failed`,
                        );
                    }

                    const googleUserDto: GoogleUserDto = {
                        name: user.displayName,
                        email: user.emails?.[0]?.value ?? '',
                        avatar: user.photos?.[0]?.value ?? '',
                        googleId: user.id as string,
                    };

                    const result =
                        await this._googleAuthUseCase.execute(googleUserDto);

                    if (result.isFailure) {
                        return res.redirect(
                            `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(result.getError())}`,
                        );
                    }

                    const { accessToken, refreshToken } = result.getValue();

                    res.cookie('accessToken', accessToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                        domain: process.env.FRONTEND_HOST,
                        maxAge: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRY,
                    });

                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                        domain: process.env.FRONTEND_HOST,
                        maxAge: JWT_CONSTANTS.REFRESH_TOKEN_EXPIRY,
                    });

                    res.redirect(
                        `${process.env.FRONTEND_URL}/home?success=true`,
                    );
                },
            )(req, res);
        },
    );

    /**
     * Completes remaining profile fields for the authenticated user.
     *
     * @param req - Express request; `body` merged with `userId` from `req.user` and validated
     * @param res - Express response for JSON output
     * @returns Promise that settles after profile completion payload is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or the use case fails
     */
    completeProfile = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    AUTH_MESSAGES.USER_NOT_FOUND,
                    AUTH_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodCompleteProfileInputType>(
                    completeProfileSchema,
                    {
                        ...req.body,
                        userId: req.user.id,
                    },
                );

            const result =
                await this._completeProfileUseCase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    AUTH_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<CompleteProfileOutput>(
                res,
                result.getValue(),
                AUTH_CONSTANTS.MESSAGES.PROFILE_COMPLETED_SUCCESSFULLY,
                AUTH_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Starts forgot-password flow (e.g. email with reset link) for the submitted address.
     *
     * @param req - Express request; `body` validated with `forgottenPasswordSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after the acknowledgement is sent
     * @throws {AppError} When validation fails or the use case fails
     */
    forgotPassword = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodForgottenPasswordInputType>(
                    forgottenPasswordSchema,
                    req.body,
                );

            const result =
                await this._forgotPasswordUseCase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    AUTH_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<null>(
                res,
                null,
                AUTH_CONSTANTS.MESSAGES.FORGOT_PASSWORD_SENT_SUCCESSFULLY,
                AUTH_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Changes password using token or current-password fields from the validated body.
     *
     * @param req - Express request; `body` validated with `changePasswordSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after the success acknowledgement is sent
     * @throws {AppError} When validation fails or the password change use case fails
     */
    changePassword = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodChangePasswordInputType>(
                    changePasswordSchema,
                    req.body,
                );

            const result =
                await this._changePasswordUseCase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    AUTH_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<null>(
                res,
                null,
                AUTH_CONSTANTS.MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY,
                AUTH_CONSTANTS.CODES.OK,
            );
        },
    );
}

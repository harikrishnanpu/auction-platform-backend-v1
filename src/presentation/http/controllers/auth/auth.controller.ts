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
import {
  CompleteProfileInput,
  CompleteProfileOutput,
} from '@application/dtos/auth/completeProfile.dto';
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
import { ChangePasswordInput } from '@application/dtos/auth/changePassword.dto';
import { JWT_CONSTANTS } from '@presentation/constants/jwt/jwt.constants';
import { ISendOtpUsecase } from '@application/interfaces/usecases/otp/ISendOtpUsecase';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import {
  VerifyCredentialsInput,
  verifyCredentialsOutput,
} from '@application/dtos/auth/verifyCredentials.dto';
import { RegisterUserMapper } from '@application/mappers/auth/register.mapper';
import { RegisterUserOutputDto } from '@application/dtos/auth/registerUser.dto';
import { SendEmailVerificationCodeMapper } from '@application/mappers/auth/sendOtp.mapper';
import {
  LoginUserInput,
  LoginUserOutput,
} from '@application/dtos/auth/loginUser.dto';
import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import { AuthMapperProfile } from '@infrastructure/mappers/auth/auth.mapper';
import { ForgotPasswordInput } from '@application/dtos/auth/forgotPassword.dto';

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
   * @description Register a new user
   * @returns ApiResponse<RegisterUserOutput>
   */

  register = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = ValidationHelper.validate<ZodRegisterInputType>(
      registerSchema,
      req.body,
    );

    const dto = RegisterUserMapper.toDto(validationResult);

    const result = await this._registerUseCase.execute(dto);

    if (result.isFailure) {
      console.log('error');
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    ResponseHelper.success<RegisterUserOutputDto>(
      res,
      result.getValue(),
      AUTH_CONSTANTS.MESSAGES.USER_REGISTERED_SUCCESSFULLY,
      AUTH_CONSTANTS.CODES.CREATED,
    );
  });

  /**
   * @description Send a verification code to the user's email
   * @returns ApiResponse<void>
   */

  sendVerificationCode = expressAsyncHandler(
    async (req: Request, res: Response) => {
      console.log(req.body);

      const validationResult =
        ValidationHelper.validate<ZodSendVerificationCodeInputType>(
          sendVerificationCodeSchema,
          req.body,
        );

      const dto = SendEmailVerificationCodeMapper.toDto(validationResult);

      const result = await this._sendOtpUsecase.execute(dto);

      if (result.isFailure) {
        console.log('error');
        throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
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
   * @description Verify the user's credentials
   * @returns ApiResponse<VerifyCredentialsOutput>
   */

  verifyCredentials = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const validationResult =
        ValidationHelper.validate<ZodVerifyCredentialsInputType>(
          verifyCredentialsSchema,
          req.body,
        );

      // console.log(validationResult.error?.format());

      const dto: VerifyCredentialsInput =
        AuthMapperProfile.toVerifyCredentialsInput(validationResult);

      const result = await this._verifyCredentialsUseCase.execute(dto);

      if (result.isFailure) {
        console.log('error');
        throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
      }

      ResponseHelper.success<verifyCredentialsOutput>(
        res,
        result.getValue(),
        AUTH_CONSTANTS.MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
        AUTH_CONSTANTS.CODES.OK,
      );
    },
  );

  login = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = ValidationHelper.validate<ZodLoginInputType>(
      loginSchema,
      req.body,
    );

    const dto: LoginUserInput =
      AuthMapperProfile.toLoginUserInput(validationResult);

    const result = await this._loginUseCase.execute(dto);

    if (result.isFailure) {
      console.log('error');
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    ResponseHelper.success<LoginUserOutput>(
      res,
      result.getValue(),
      AUTH_CONSTANTS.MESSAGES.LOGIN_SUCCESSFULLY,
      AUTH_CONSTANTS.CODES.OK,
    );
  });

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
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    ResponseHelper.success<userResponseDto>(
      res,
      result.getValue(),
      AUTH_CONSTANTS.MESSAGES.USER_FETCHED_SUCCESSFULLY,
      AUTH_CONSTANTS.CODES.OK,
    );
  });

  googleAuth = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
      })(req, res, next);
    },
  );

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

          const result = await this._googleAuthUseCase.execute(googleUserDto);

          if (result.isFailure) {
            return res.redirect(
              `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(result.getError())}`,
            );
          }

          const { accessToken, refreshToken } = result.getValue();

          res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: JWT_CONSTANTS.ACCESS_TOKEN_EXPIRY,
            sameSite: 'lax',
          });

          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: JWT_CONSTANTS.REFRESH_TOKEN_EXPIRY,
            sameSite: 'lax',
          });

          res.redirect(`${process.env.FRONTEND_URL}/home?success=true`);
        },
      )(req, res);
    },
  );

  completeProfile = expressAsyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(
        AUTH_MESSAGES.USER_NOT_FOUND,
        AUTH_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const validationResult =
      ValidationHelper.validate<ZodCompleteProfileInputType>(
        completeProfileSchema,
        req.body,
      );

    const dto: CompleteProfileInput = AuthMapperProfile.toCompleteProfileInput(
      validationResult,
      req.user.id,
    );

    const result = await this._completeProfileUseCase.execute(dto);

    if (result.isFailure) {
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    ResponseHelper.success<CompleteProfileOutput>(
      res,
      result.getValue(),
      AUTH_CONSTANTS.MESSAGES.PROFILE_COMPLETED_SUCCESSFULLY,
      AUTH_CONSTANTS.CODES.OK,
    );
  });

  forgotPassword = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult =
      ValidationHelper.validate<ZodForgottenPasswordInputType>(
        forgottenPasswordSchema,
        req.body,
      );

    const dto: ForgotPasswordInput =
      AuthMapperProfile.toForgotPasswordInput(validationResult);

    const result = await this._forgotPasswordUseCase.execute(dto);

    if (result.isFailure) {
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    ResponseHelper.success<null>(
      res,
      null,
      AUTH_CONSTANTS.MESSAGES.FORGOT_PASSWORD_SENT_SUCCESSFULLY,
      AUTH_CONSTANTS.CODES.OK,
    );
  });

  changePassword = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult =
      ValidationHelper.validate<ZodChangePasswordInputType>(
        changePasswordSchema,
        req.body,
      );

    const dto: ChangePasswordInput =
      AuthMapperProfile.toChangePasswordInput(validationResult);

    const result = await this._changePasswordUseCase.execute(dto);

    if (result.isFailure) {
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    ResponseHelper.success<null>(
      res,
      null,
      AUTH_CONSTANTS.MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY,
      AUTH_CONSTANTS.CODES.OK,
    );
  });
}

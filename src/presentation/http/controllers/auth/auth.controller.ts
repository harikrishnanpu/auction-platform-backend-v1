import { RegisterUserInput } from '@application/dtos/auth/registerUser.dto';
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
import { registerSchema } from '@presentation/validators/schemas/auth/register.schema';
import { sendVerificationCodeSchema } from '@presentation/validators/schemas/auth/sendVerificationCode.schema';
import { verifyCredentialsSchema } from '@presentation/validators/schemas/auth/verifyCredentials.schema';
import { IVerifyCredentialsUseCase } from '@application/interfaces/usecases/auth/IVerifyCredentialsUseCase';
import { ILoginUseCase } from '@application/interfaces/usecases/auth/ILoginUsecase';
import { loginSchema } from '@presentation/validators/schemas/auth/login.schema';
import { IGetUserUsecase } from '@application/interfaces/usecases/auth/IGetUserUsecase';
import passport, { Profile } from 'passport';
import { IGoogleAuthUsecase } from '@application/interfaces/usecases/auth/IGoogleAuthUsecase';
import { GoogleUserDto } from '@application/dtos/auth/googleUser.dto';
import { completeProfileSchema } from '@presentation/validators/schemas/auth/completeProfile.schema';
import { ICompleteProfileUsecase } from '@application/interfaces/usecases/auth/ICompleteProfileUsecase';
import { CompleteProfileInput } from '@application/dtos/auth/completeProfile.dto';
import { forgottenPasswordSchema } from '@presentation/validators/schemas/auth/forgottenPassword.schema';
import { IForgotPasswordUsecase } from '@application/interfaces/usecases/auth/IForgotPasswordUsecase';
import { IChangePasswordUsecase } from '@application/interfaces/usecases/auth/IChangePasswordUsecase';
import { changePasswordSchema } from '@presentation/validators/schemas/auth/changePassword.schema';
import { ChangePasswordInput } from '@application/dtos/auth/changePassword.dto';
import { JWT_CONSTANTS } from '@presentation/constants/jwt/jwt.constants';
import { ISendOtpUsecase } from '@application/interfaces/usecases/otp/ISendOtpUsecase';
import { SendOtpInput } from '@application/dtos/otp/SendOtp.dto';
import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';

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

  register = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = registerSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        AUTH_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const { firstName, lastName, email, phone, password, address } =
      validationResult.data;

    const registerUserDto: RegisterUserInput = {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      password,
      address,
    };

    const result = await this._registerUseCase.execute(registerUserDto);

    if (result.isFailure) {
      console.log('error');
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    res.status(AUTH_CONSTANTS.CODES.CREATED).json({
      data: result.getValue(),
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.USER_REGISTERED_SUCCESSFULLY,
      status: AUTH_CONSTANTS.CODES.CREATED,
      error: null,
    });
  });

  sendVerificationCode = expressAsyncHandler(
    async (req: Request, res: Response) => {
      console.log(req.body);
      const validationResult = sendVerificationCodeSchema.safeParse(req.body);

      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0].message,
          AUTH_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const sendOtpInput: SendOtpInput = {
        email: validationResult.data.email,
        purpose: OtpPurpose.VERIFY_EMAIL,
        channel: OtpChannel.EMAIL,
      };

      const result = await this._sendOtpUsecase.execute(sendOtpInput);

      if (result.isFailure) {
        console.log('error');
        throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
      }

      res.status(AUTH_CONSTANTS.CODES.OK).json({
        data: null,
        success: true,
        message: AUTH_CONSTANTS.MESSAGES.VERIFICATION_CODE_SENT_SUCCESSFULLY,
        status: AUTH_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  verifyCredentials = expressAsyncHandler(
    async (req: Request, res: Response) => {
      const validationResult = verifyCredentialsSchema.safeParse(req.body);

      // console.log(validationResult.error?.format());

      if (!validationResult.success) {
        throw new AppError(
          validationResult.error.issues[0].message,
          AUTH_CONSTANTS.CODES.BAD_REQUEST,
        );
      }

      const { otp, email, purpose, channel } = validationResult.data;

      console.log(validationResult.data);

      const result = await this._verifyCredentialsUseCase.execute(
        otp,
        email,
        purpose,
        channel,
      );

      if (result.isFailure) {
        console.log('error');
        throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
      }

      res.status(AUTH_CONSTANTS.CODES.OK).json({
        data: {
          user: result.getValue().user,
          accessToken: result.getValue().accessToken,
          refreshToken: result.getValue().refreshToken,
        },
        success: true,
        message: AUTH_CONSTANTS.MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
        status: AUTH_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );

  login = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        AUTH_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const { email, password } = validationResult.data;

    const result = await this._loginUseCase.execute({ email, password });

    if (result.isFailure) {
      console.log('error');
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    res.status(AUTH_CONSTANTS.CODES.OK).json({
      data: {
        user: result.getValue().user,
        accessToken: result.getValue().accessToken,
        refreshToken: result.getValue().refreshToken,
      },
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.LOGIN_SUCCESSFULLY,
      status: AUTH_CONSTANTS.CODES.OK,
      error: null,
    });
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

    res.status(AUTH_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.USER_FETCHED_SUCCESSFULLY,
      status: AUTH_CONSTANTS.CODES.OK,
      error: null,
    });
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
    const validationResult = completeProfileSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        AUTH_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const { phone, address } = validationResult.data;

    if (!req.user) {
      throw new AppError(
        AUTH_MESSAGES.USER_NOT_FOUND,
        AUTH_CONSTANTS.CODES.BAD_REQUEST,
      );
    }
    const userId = req.user.id;

    const completeProfileInput: CompleteProfileInput = {
      userId,
      phone,
      address,
    };

    const result =
      await this._completeProfileUseCase.execute(completeProfileInput);

    if (result.isFailure) {
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    const user = result.getValue().user;

    res.status(AUTH_CONSTANTS.CODES.OK).json({
      data: user,
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.PROFILE_COMPLETED_SUCCESSFULLY,
      status: AUTH_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  forgotPassword = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = forgottenPasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        AUTH_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const { email } = validationResult.data;

    const result = await this._forgotPasswordUseCase.execute(email);

    if (result.isFailure) {
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    res.status(AUTH_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.FORGOT_PASSWORD_SENT_SUCCESSFULLY,
      status: AUTH_CONSTANTS.CODES.OK,
      error: null,
    });
  });

  changePassword = expressAsyncHandler(async (req: Request, res: Response) => {
    const validationResult = changePasswordSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(
        validationResult.error.issues[0].message,
        AUTH_CONSTANTS.CODES.BAD_REQUEST,
      );
    }

    const { token, newPassword } = validationResult.data;

    const changePasswordInput: ChangePasswordInput = {
      token,
      newPassword,
    };

    const result =
      await this._changePasswordUseCase.execute(changePasswordInput);

    if (result.isFailure) {
      throw new AppError(result.getError(), AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    res.status(AUTH_CONSTANTS.CODES.OK).json({
      data: result.getValue(),
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.PASSWORD_CHANGED_SUCCESSFULLY,
      status: AUTH_CONSTANTS.CODES.OK,
      error: null,
    });
  });
}

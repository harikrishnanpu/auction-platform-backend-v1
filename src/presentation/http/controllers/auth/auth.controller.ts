import { RegisterUserInput } from '@application/dtos/auth/registerUser.dto';
import { IRegisterUseCase } from '@application/interfaces/usecases/IRegisterUsecase';
import { AUTH_CONSTANTS } from '@presentation/constants/auth/auth.constants';
import { TYPES } from '@di/types.di';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { AppError } from '@presentation/http/error/app.error';
import expressAsyncHandler from 'express-async-handler';
import { registerSchema } from '@presentation/validators/schemas/auth/register.schema';
import { sendVerificationCodeSchema } from '@presentation/validators/schemas/auth/sendVerificationCode.schema';
import { ISendVerificationCodeUsecase } from '@application/interfaces/usecases/ISendVerificationCodeUsecase';
import { verifyCredentialsSchema } from '@presentation/validators/schemas/auth/verifyCredentials.schema';
import { IVerifyCredentialsUseCase } from '@application/interfaces/usecases/IVerifyCredentialsUseCase';
import { ILoginUseCase } from '@application/interfaces/usecases/ILoginUsecase';
import { loginSchema } from '@presentation/validators/schemas/auth/login.schema';
import { IGetUserUsecase } from '@application/interfaces/usecases/IGetUserUsecase';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.IRegisterUseCase)
    private readonly _registerUseCase: IRegisterUseCase,
    @inject(TYPES.ISendVerificationCodeUsecase)
    private readonly _sendVerificationCodeUseCase: ISendVerificationCodeUsecase,
    @inject(TYPES.IVerifyCredentialsUseCase)
    private readonly _verifyCredentialsUseCase: IVerifyCredentialsUseCase,
    @inject(TYPES.ILoginUseCase)
    private readonly _loginUseCase: ILoginUseCase,
    @inject(TYPES.IGetUserUsecase)
    private readonly _getUserUseCase: IGetUserUsecase,
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

      const { email } = validationResult.data;

      const result = await this._sendVerificationCodeUseCase.execute(email);

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

      res.cookie('accessToken', result.getValue().accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: 'strict',
      });

      res.cookie('refreshToken', result.getValue().refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: 'strict',
      });

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

    res.cookie('accessToken', result.getValue().accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      sameSite: 'strict',
    });

    res.cookie('refreshToken', result.getValue().refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      sameSite: 'strict',
    });

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
    const userId = req.user;

    if (!userId) {
      throw new AppError('User not found', AUTH_CONSTANTS.CODES.BAD_REQUEST);
    }

    const result = await this._getUserUseCase.execute(userId as string);

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
}

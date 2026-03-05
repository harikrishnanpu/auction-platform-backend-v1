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

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.IRegisterUseCase)
    private readonly _registerUseCase: IRegisterUseCase,
    @inject(TYPES.ISendVerificationCodeUsecase)
    private readonly _sendVerificationCodeUseCase: ISendVerificationCodeUsecase,
    @inject(TYPES.IVerifyCredentialsUseCase)
    private readonly _verifyCredentialsUseCase: IVerifyCredentialsUseCase,
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

      res.status(AUTH_CONSTANTS.CODES.OK).json({
        data: null,
        success: true,
        message: AUTH_CONSTANTS.MESSAGES.EMAIL_VERIFIED_SUCCESSFULLY,
        status: AUTH_CONSTANTS.CODES.OK,
        error: null,
      });
    },
  );
}

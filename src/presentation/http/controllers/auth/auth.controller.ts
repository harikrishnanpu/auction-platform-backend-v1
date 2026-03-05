import { RegisterUserInput } from '@application/dtos/auth/registerUser.dto';
import { IRegisterUseCase } from '@application/interfaces/usecases/IRegisterUsecase';
import { AUTH_CONSTANTS } from '@presentation/constants/auth/auth.constants';
import { TYPES } from '@di/types.di';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { AppError } from '@presentation/http/error/app.error';
import expressAsyncHandler from 'express-async-handler';
import { registerSchema } from '@presentation/validators/schemas/auth/register.schema';

@injectable()
export class AuthController {
  private _registerUseCase: IRegisterUseCase;

  constructor(
    @inject(TYPES.IRegisterUseCase)
    registerUseCase: IRegisterUseCase,
  ) {
    this._registerUseCase = registerUseCase;
  }

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
}

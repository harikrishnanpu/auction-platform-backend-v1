import { RegisterUserInput } from '@application/dtos/auth/registerUser.dto';
import { IRegisterUseCase } from '@application/interfaces/usecases/IRegisterUsecase';
import { AUTH_CONSTANTS } from '@presentation/constants/auth/auth.constants';
import { Request, Response } from 'express';

export class AuthController {
  registerUseCase: IRegisterUseCase;

  constructor(registerUseCase: IRegisterUseCase) {
    this.registerUseCase = registerUseCase;
  }

  register = async (req: Request, res: Response) => {
    const { name, email, phone, password, address } = req.body;

    const registerUserDto: RegisterUserInput = {
      name,
      email,
      phone,
      password,
      address,
    };

    const result = await this.registerUseCase.execute(registerUserDto);

    if (result.isFailure) {
      return res.status(AUTH_CONSTANTS.CODES.BAD_REQUEST).json({
        data: null,
        message: AUTH_CONSTANTS.MESSAGES.INVALID_INPUT,
        status: AUTH_CONSTANTS.CODES.BAD_REQUEST,
        error: result.getError(),
      });
    }

    return res.status(AUTH_CONSTANTS.CODES.CREATED).json({
      data: result.getValue(),
      message: AUTH_CONSTANTS.MESSAGES.USER_REGISTERED_SUCCESSFULLY,
      status: AUTH_CONSTANTS.CODES.CREATED,
      error: null,
    });
  };
}

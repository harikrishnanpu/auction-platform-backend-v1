import { RegisterUserOutputDto } from '@application/dtos/auth/registerUser.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedRegisterInput {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    password: string;
}

export interface IRegisterUseCase {
    execute(
        data: IValidatedRegisterInput,
    ): Promise<Result<RegisterUserOutputDto>>;
}

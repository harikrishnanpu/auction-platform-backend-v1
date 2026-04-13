import { RegisterUserOutputDto } from '@application/dtos/auth/registerUser.dto';
import { Result } from '@domain/shared/result';
import { ZodRegisterInputType } from '@presentation/validators/schemas/auth/register.schema';

export interface IRegisterUseCase {
    execute(data: ZodRegisterInputType): Promise<Result<RegisterUserOutputDto>>;
}

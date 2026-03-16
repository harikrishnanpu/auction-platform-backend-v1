import { RegisterUserInputDto } from '@application/dtos/auth/registerUser.dto';
import { RegisterInput } from '@presentation/validators/schemas/auth/register.schema';

export class RegisterUserMapper {
  public static toDto(data: RegisterInput): RegisterUserInputDto {
    return {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      password: data.password,
      address: data.address,
    };
  }
}

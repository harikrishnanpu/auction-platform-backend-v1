import { ChangePasswordInput } from '@application/dtos/auth/changePassword.dto';
import { CompleteProfileInput } from '@application/dtos/auth/completeProfile.dto';
import { ForgotPasswordInput } from '@application/dtos/auth/forgotPassword.dto';
import { LoginUserInput } from '@application/dtos/auth/loginUser.dto';
import { VerifyCredentialsInput } from '@application/dtos/auth/verifyCredentials.dto';
import { ZodChangePasswordInputType } from '@presentation/validators/schemas/auth/changePassword.schema';
import { ZodCompleteProfileInputType } from '@presentation/validators/schemas/auth/completeProfile.schema';
import { ZodForgottenPasswordInputType } from '@presentation/validators/schemas/auth/forgottenPassword.schema';
import { ZodLoginInputType } from '@presentation/validators/schemas/auth/login.schema';
import { ZodVerifyCredentialsInputType } from '@presentation/validators/schemas/auth/verifyCredentials.schema';

export class AuthMapperProfile {
  public static toVerifyCredentialsInput(
    data: ZodVerifyCredentialsInputType,
  ): VerifyCredentialsInput {
    return {
      otp: data.otp,
      email: data.email,
      purpose: data.purpose,
      channel: data.channel,
    };
  }

  public static toLoginUserInput(data: ZodLoginInputType): LoginUserInput {
    return {
      email: data.email,
      password: data.password,
    };
  }

  public static toCompleteProfileInput(
    data: ZodCompleteProfileInputType,
    userId: string,
  ): CompleteProfileInput {
    return {
      userId,
      phone: data.phone,
      address: data.address,
    };
  }

  public static toForgotPasswordInput(
    data: ZodForgottenPasswordInputType,
  ): ForgotPasswordInput {
    return {
      email: data.email,
    };
  }

  public static toChangePasswordInput(
    data: ZodChangePasswordInputType,
  ): ChangePasswordInput {
    return {
      token: data.token,
      newPassword: data.newPassword,
    };
  }
}

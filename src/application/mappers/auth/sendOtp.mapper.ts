import { SendVerificationCodeInputDto } from '@application/dtos/otp/SendOtp.dto';
import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';
import { SendVerificationCodeInput } from '@presentation/validators/schemas/auth/sendVerificationCode.schema';

export class SendEmailVerificationCodeMapper {
  public static toDto(
    data: SendVerificationCodeInput,
  ): SendVerificationCodeInputDto {
    return {
      email: data.email,
      purpose: OtpPurpose.VERIFY_EMAIL,
      channel: OtpChannel.EMAIL,
    };
  }
}

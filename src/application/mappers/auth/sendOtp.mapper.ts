import { SendVerificationCodeInputDto } from '@application/dtos/otp/SendOtp.dto';
import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';
import { ZodSendVerificationCodeInputType } from '@presentation/validators/schemas/auth/sendVerificationCode.schema';

export class SendEmailVerificationCodeMapper {
    public static toDto(
        data: ZodSendVerificationCodeInputType,
    ): SendVerificationCodeInputDto {
        return {
            email: data.email,
            purpose: OtpPurpose.VERIFY_EMAIL,
            channel: OtpChannel.EMAIL,
        };
    }
}

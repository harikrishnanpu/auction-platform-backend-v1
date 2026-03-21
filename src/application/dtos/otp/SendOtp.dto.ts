import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';

export interface SendVerificationCodeInputDto {
  email: string;
  purpose: OtpPurpose;
  channel: OtpChannel;
}

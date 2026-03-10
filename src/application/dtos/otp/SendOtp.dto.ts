import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';

export interface SendOtpInput {
  email: string;
  purpose: OtpPurpose;
  channel: OtpChannel;
}

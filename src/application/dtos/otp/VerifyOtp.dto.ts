import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';

export interface VerifyOtpInput {
  userId: string;
  purpose: OtpPurpose;
  channel: OtpChannel;
  otp: string;
}

export interface VerifyOtpOutput {
  userId: string;
}

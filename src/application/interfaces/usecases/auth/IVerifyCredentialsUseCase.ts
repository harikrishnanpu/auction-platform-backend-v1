import { verifyCredentialsOutput } from '@application/dtos/auth/verifyCredentials.dto';
import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';
import { Result } from '@domain/shared/result';

export interface IVerifyCredentialsUseCase {
  execute(
    otp: string,
    userId: string,
    purpose: OtpPurpose,
    channel: OtpChannel,
  ): Promise<Result<verifyCredentialsOutput>>;
}

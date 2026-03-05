import { Otp, OtpPurpose } from '@domain/entities/otp/otp.entity';

export interface IOtpRepository {
  save(otp: Otp): Promise<void>;

  findByUserIdAndPurpose(
    userId: string,
    purpose: OtpPurpose,
  ): Promise<Otp | null>;

  findRecentOtpByUserIdAndPurpose(
    userId: string,
    purpose: OtpPurpose,
  ): Promise<Otp[] | []>;
}

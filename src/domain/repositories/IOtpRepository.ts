import { Otp, OtpPurpose } from '@domain/entities/otp/otp.entity';

export interface IOtpRepository {
  save(otp: Otp): Promise<void>;

  update(otp: Otp): Promise<void>;

  findRecentOtpByUserIdAndPurpose(
    userId: string,
    purpose: OtpPurpose,
  ): Promise<Otp | null>;

  findRecentOtpsByUserIdAndPurpose(
    userId: string,
    purpose: OtpPurpose,
  ): Promise<Otp[] | []>;
}

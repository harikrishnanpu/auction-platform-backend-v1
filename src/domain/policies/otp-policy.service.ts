import { Otp } from '../entities/otp/otp.entity';
import { OtpStatus } from '../entities/otp/otp.entity';

export class OtpPolicyService {
  private readonly MAX_PENDING_OTPS = 3;

  canGenerateOtp(previousOtps: Otp[]): boolean {
    const pendingCount = previousOtps.filter(
      (otp) => otp.getOtpStatus() === OtpStatus.PENDING,
    ).length;

    return pendingCount < this.MAX_PENDING_OTPS;
  }

  isExpired(otp: Otp): boolean {
    return otp.getExpiresAt().getTime() < Date.now();
  }
}

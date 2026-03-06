import {
  Otp,
  OtpChannel,
  OtpPurpose,
  OtpStatus,
} from '@domain/entities/otp/otp.entity';
import { Result } from '@domain/shared/result';
import { Otp as PrismaOtp } from '@prisma/client';

export class OtpMapper {
  static toDomain(otp: PrismaOtp): Result<Otp> {
    const otpEntity = Otp.create({
      id: otp.id,
      userId: otp.userId,
      purpose: otp.purpose as OtpPurpose,
      channel: otp.channel as OtpChannel,
      otp: otp.otp,
      expiresAt: otp.expiresAt,
      status: otp.status as OtpStatus,
      createdAt: otp.createdAt,
      attempts: otp.attempts,
    });

    if (otpEntity.isFailure) {
      return Result.fail('otp mapping failed');
    }

    return otpEntity;
  }

  static toPersistence(otp: Otp) {
    return {
      userId: otp.getUserId(),
      purpose: otp.getPurpose(),
      channel: otp.getChannel(),
      otp: otp.getOtp(),
      expiresAt: otp.getExpiresAt(),
      status: otp.getOtpStatus(),
    };
  }
}

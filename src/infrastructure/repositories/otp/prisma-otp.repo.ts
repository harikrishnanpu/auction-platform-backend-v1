import { TYPES } from '@di/types.di';
import { Otp, OtpPurpose } from '@domain/entities/otp/otp.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { OtpMapper } from '@infrastructure/mappers/otp/otp.mapper';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaOtpRepo implements IOtpRepository {
  constructor(
    @inject(TYPES.PrismaClient)
    private readonly prisma: PrismaClient,
  ) {}

  async save(otp: Otp): Promise<void> {
    await this.prisma.otp.create({
      data: {
        userId: otp.getUserId(),
        otp: otp.getOtp(),
        expiresAt: otp.getExpiresAt(),
        status: otp.getOtpStatus(),
        purpose: otp.getPurpose(),
        channel: otp.getChannel(),
      },
    });
  }

  async findByUserIdAndPurpose(
    userId: string,
    purpose: OtpPurpose,
  ): Promise<Otp | null> {
    const otp = await this.prisma.otp.findUnique({
      where: {
        userId_purpose: {
          userId,
          purpose,
        },
      },
    });

    if (!otp) {
      return null;
    }

    const otpEntity = OtpMapper.toDomain(otp);
    if (otpEntity.isFailure) {
      return null;
    }
    return otpEntity.getValue();
  }

  async findRecentOtpByUserIdAndPurpose(
    userId: string,
    otpPurpose: OtpPurpose,
  ): Promise<Otp[] | []> {
    const otps = await this.prisma.otp.findMany({
      where: {
        userId,
        purpose: otpPurpose,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otps) {
      return [];
    }

    const otpEntities = otps.map((otp) => OtpMapper.toDomain(otp));

    if (otpEntities.some((otp) => otp.isFailure)) {
      return [];
    }

    return otpEntities.map((otp) => otp.getValue());
  }
}

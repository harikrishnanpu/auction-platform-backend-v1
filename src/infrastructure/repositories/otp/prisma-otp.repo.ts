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
        id: otp.getId(),
        userId: otp.getUserId(),
        otp: otp.getOtp(),
        expiresAt: otp.getExpiresAt(),
        status: otp.getOtpStatus(),
        purpose: otp.getPurpose(),
        channel: otp.getChannel(),
      },
    });
  }

  async update(otp: Otp): Promise<void> {
    await this.prisma.otp.update({
      where: {
        id: otp.getId(),
      },
      data: {
        status: otp.getOtpStatus(),
      },
    });
  }

  async findRecentOtpByUserIdAndPurpose(
    userId: string,
    purpose: OtpPurpose,
  ): Promise<Otp | null> {
    const otp = await this.prisma.otp.findFirst({
      where: {
        userId,
        purpose,
      },
      orderBy: {
        createdAt: 'desc',
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

  async findRecentOtpsByUserIdAndPurpose(
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
      take: 3,
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

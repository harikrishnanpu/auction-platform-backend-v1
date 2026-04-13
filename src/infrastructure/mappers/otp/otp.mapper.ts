import {
    Otp,
    OtpChannel,
    OtpPurpose,
    OtpStatus,
} from '@domain/entities/otp/otp.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { Otp as PrismaOtp } from '@prisma/client';

export class OtpMapper implements IDbMapper<Otp, PrismaOtp> {
    toDomain(otp: PrismaOtp): Result<Otp> {
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

        return Result.ok(otpEntity.getValue());
    }

    toPersistence(otp: Otp): unknown {
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

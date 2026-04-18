import { TYPES } from '@di/types.di';
import { Otp, OtpPurpose } from '@domain/entities/otp/otp.entity';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Otp as PrismaOtp } from '@prisma/client';

@injectable()
export class PrismaOtpRepo
    extends BaseRepository<
        Otp,
        PrismaOtp,
        { id: string },
        IDbMapper<Otp, PrismaOtp>
    >
    implements IOtpRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.OtpMapper)
        readonly mapper: IDbMapper<Otp, PrismaOtp>,
    ) {
        super(_prisma.otp, mapper);
    }

    async findRecentOtpByUserIdAndPurpose(
        userId: string,
        purpose: OtpPurpose,
    ): Promise<Otp | null> {
        const otp = await this._prisma.otp.findFirst({
            where: {
                userId,
                purpose: purpose,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (!otp) {
            return null;
        }

        const otpEntity = this.mapper.toDomain(otp);

        if (otpEntity.isFailure) {
            return null;
        }

        return otpEntity.getValue();
    }

    async findRecentOtpsByUserIdAndPurpose(
        userId: string,
        otpPurpose: OtpPurpose,
    ): Promise<Otp[] | []> {
        const otps = await this._prisma.otp.findMany({
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

        const otpEntities = otps.map((otp) => this.mapper.toDomain(otp));

        if (otpEntities.some((otp) => otp.isFailure)) {
            return [];
        }

        return otpEntities.map((otp) => otp.getValue());
    }
}

import { TYPES } from '@di/types.di';
import { Kyc, KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { Result } from '@domain/shared/result';
import { PrismaKycWithDocuments } from '@infrastructure/mappers/kyc/kyc.mapper';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { Kyc as PrismaKyc } from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';

@injectable()
export class PrismaKycRepo
    extends BaseRepository<
        Kyc,
        PrismaKyc,
        { id: string },
        IDbMapper<Kyc, PrismaKyc>
    >
    implements IKycRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.KycMapper)
        readonly mapper: IDbMapper<Kyc, PrismaKyc>,
    ) {
        super(_prisma.kyc, mapper);
    }

    async findByUserIdAndFor(
        userId: string,
        kycFor: KycFor,
    ): Promise<Result<Kyc | null>> {
        const kyc = await this._prisma.kyc.findUnique({
            where: {
                userId_for: {
                    userId: userId,
                    for: kycFor,
                },
            },
            include: {
                documents: true,
            },
        });

        if (!kyc) return Result.ok();

        const kycResult = this.mapper.toDomain(kyc);

        if (kycResult.isFailure) return Result.fail(kycResult.getError());

        return Result.ok(kycResult.getValue());
    }

    async findAllByKycFor(
        kycFor: KycFor,
        options?: { excludeStatus?: KycStatus; skip?: number; take?: number },
    ): Promise<Result<{ kycs: Kyc[]; total: number }>> {
        const where = {
            for: kycFor,
            ...(options?.excludeStatus != null && {
                status: { not: options.excludeStatus },
            }),
        };

        const [total, kycs] = await Promise.all([
            this._prisma.kyc.count({ where }),
            this._prisma.kyc.findMany({
                where,
                skip: options?.skip,
                take: options?.take,
                orderBy: { createdAt: 'desc' },
                include: { documents: true },
            }),
        ]);

        const domainKycs: Kyc[] = [];
        for (const kyc of kycs as PrismaKycWithDocuments[]) {
            const kycResult = this.mapper.toDomain(kyc);
            if (kycResult.isFailure) return Result.fail(kycResult.getError());
            domainKycs.push(kycResult.getValue());
        }
        return Result.ok({ kycs: domainKycs, total });
    }
}

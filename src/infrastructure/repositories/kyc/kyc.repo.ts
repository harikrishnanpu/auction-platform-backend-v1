import { TYPES } from '@di/types.di';
import { Kyc, KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { Result } from '@domain/shared/result';
import {
  KycMapper,
  PrismaKycWithDocuments,
} from '@infrastructure/mappers/kyc/kyc.mapper';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaKycRepo implements IKycRepository {
  constructor(
    @inject(TYPES.PrismaClient)
    private readonly _prisma: PrismaClient,
  ) {}

  async findByUserIdAndFor(
    userId: string,
    kycFor: KycFor,
  ): Promise<Result<Kyc>> {
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

    const kycResult = KycMapper.toDomain(kyc);

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
      const kycResult = KycMapper.toDomain(kyc);
      if (kycResult.isFailure) return Result.fail(kycResult.getError());
      domainKycs.push(kycResult.getValue());
    }
    return Result.ok({ kycs: domainKycs, total });
  }

  async save(kyc: Kyc): Promise<void> {
    const kycPersistence = KycMapper.toPersistence(kyc);

    await this._prisma.kyc.upsert({
      where: {
        userId_for: {
          userId: kycPersistence.userId,
          for: kycPersistence.for,
        },
      },
      create: {
        id: kycPersistence.id,
        userId: kycPersistence.userId,
        for: kycPersistence.for,
        status: kycPersistence.status,
        rejectionReason: kycPersistence.rejectionReason ?? undefined,
      },
      update: {
        status: kycPersistence.status,
        userId: kycPersistence.userId,
        for: kycPersistence.for,
        rejectionReason: kycPersistence.rejectionReason ?? undefined,
      },
    });
  }
}

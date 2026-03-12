import { TYPES } from '@di/types.di';
import { Kyc, KycFor } from '@domain/entities/kyc/kyc.entity';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { Result } from '@domain/shared/result';
import { KycMapper } from '@infrastructure/mappers/kyc/kyc.mapper';
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

    if (!kyc) return Result.fail('Kyc not found');

    const kycResult = KycMapper.toDomain(kyc);

    if (kycResult.isFailure) return Result.fail(kycResult.getError());

    return Result.ok(kycResult.getValue());
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
      },
      update: {
        status: kycPersistence.status,
        userId: kycPersistence.userId,
        for: kycPersistence.for,
      },
    });
  }
}

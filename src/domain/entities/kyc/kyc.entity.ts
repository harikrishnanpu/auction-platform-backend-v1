import { Result } from '@domain/shared/result';
import { KycDocument } from './kyc-document.entity';

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NOT_SUBMITTED = 'NOT_SUBMITTED',
}

export enum KycFor {
  SELLER = 'SELLER',
  MODERATOR = 'MODERATOR',
}

export class Kyc {
  constructor(
    private readonly id: string,
    private readonly userId: string,
    private kycStatus: KycStatus,
    private readonly kycFor: KycFor,
    private readonly documents?: KycDocument[],
  ) {}

  public static create({
    id,
    userId,
    kycStatus,
    kycFor,
    documents = [],
  }: {
    id: string;
    userId: string;
    kycStatus: KycStatus;
    kycFor: KycFor;
    documents?: KycDocument[];
  }): Result<Kyc> {
    return Result.ok<Kyc>(new Kyc(id, userId, kycStatus, kycFor, documents));
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getStatus(): KycStatus {
    return this.kycStatus;
  }

  public getFor(): KycFor {
    return this.kycFor;
  }

  public getDocuments(): KycDocument[] {
    return this.documents ?? [];
  }

  public submitKyc(): Result<void> {
    if (this.kycStatus == KycStatus.PENDING) {
      return Result.fail('KYC is already pending');
    }
    if (this.kycStatus == KycStatus.APPROVED) {
      return Result.fail('KYC is already approved');
    }
    if (this.kycStatus == KycStatus.REJECTED) {
      return Result.fail('KYC is already rejected');
    }

    this.kycStatus = KycStatus.PENDING;
    return Result.ok();
  }

  public getKycStatus(): KycStatus {
    return this.kycStatus;
  }
}

import { Result } from '@domain/shared/result';
import { KycDocument } from './kyc-document.entity';

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum KycFor {
  SELLER = 'SELLER',
  MODERATOR = 'MODERATOR',
}

export class Kyc {
  constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly kycStatus: KycStatus,
    private readonly kycFor: KycFor,
    private readonly documents: KycDocument[],
  ) {}

  public static create({
    id,
    userId,
    kycStatus,
    kycFor,
    documents,
  }: {
    id: string;
    userId: string;
    kycStatus: KycStatus;
    kycFor: KycFor;
    documents: KycDocument[];
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
    return this.documents;
  }
}

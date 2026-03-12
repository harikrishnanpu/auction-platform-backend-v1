import { Result } from '@domain/shared/result';

export enum DocumentType {
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  VOTER_ID = 'VOTER_ID',
  PAN_CARD = 'PAN_CARD',
}

export enum DocumentSide {
  FRONT = 'FRONT',
  BACK = 'BACK',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class KycDocument {
  constructor(
    private readonly id: string,
    private readonly kycId: string,
    private readonly documentType: DocumentType,
    private readonly side: DocumentSide,
    private readonly documentUrl: string,
    private readonly documentStatus: DocumentStatus,
  ) {}

  public static create({
    id,
    kycId,
    documentType,
    side,
    documentUrl,
    documentStatus,
  }: {
    id: string;
    kycId: string;
    documentType: DocumentType;
    side: DocumentSide;
    documentUrl: string;
    documentStatus: DocumentStatus;
  }): Result<KycDocument> {
    return Result.ok<KycDocument>(
      new KycDocument(
        id,
        kycId,
        documentType,
        side,
        documentUrl,
        documentStatus,
      ),
    );
  }

  public getId(): string {
    return this.id;
  }

  public getKycId(): string {
    return this.kycId;
  }

  public getDocumentType(): DocumentType {
    return this.documentType;
  }

  public getSide(): DocumentSide {
    return this.side;
  }

  public getDocumentUrl(): string {
    return this.documentUrl;
  }

  public getDocumentStatus(): DocumentStatus {
    return this.documentStatus;
  }

  public getDocumentId(): string {
    return this.id;
  }
}

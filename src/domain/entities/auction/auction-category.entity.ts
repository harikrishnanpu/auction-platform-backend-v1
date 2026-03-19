import { Result } from '@domain/shared/result';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';

export enum AuctionCategoryStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class AuctionCategory {
  constructor(
    private readonly id: string,
    private name: string,
    private readonly slug: AuctionCategorySlug,
    private parentId: string | null,
    private isVerified: boolean,
    private isActive: boolean,
    private status: AuctionCategoryStatus,
    private readonly submittedBy: string,
    private rejectionReason?: string | null,
  ) {}

  static create({
    id,
    name,
    slug,
    parentId = null,
    isVerified = false,
    isActive = true,
    status = AuctionCategoryStatus.PENDING,
    rejectionReason = null,
    submittedBy,
  }: {
    id: string;
    name: string;
    slug: AuctionCategorySlug;
    parentId: string | null;
    isVerified?: boolean;
    isActive?: boolean;
    status?: AuctionCategoryStatus;
    rejectionReason?: string | null;
    submittedBy: string;
  }): Result<AuctionCategory> {
    return Result.ok(
      new AuctionCategory(
        id,
        name,
        slug,
        parentId,
        isVerified,
        isActive,
        status,
        submittedBy,
        rejectionReason,
      ),
    );
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getSlug(): AuctionCategorySlug {
    return this.slug;
  }

  getIsVerified(): boolean {
    return this.isVerified;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getParentId(): string | null {
    return this.parentId;
  }

  getStatus(): AuctionCategoryStatus {
    return this.status;
  }

  approveAuctionCategory(): Result<void> {
    if (this.status !== AuctionCategoryStatus.PENDING) {
      return Result.fail('Only PENDING auction category can be approved');
    }

    this.status = AuctionCategoryStatus.APPROVED;
    return Result.ok();
  }

  verifyAuctionCategory(): Result<void> {
    if (this.status !== AuctionCategoryStatus.APPROVED) {
      return Result.fail('Auction category is not approved');
    }

    this.isVerified = true;
    return Result.ok();
  }

  changeActiveStatus(status: boolean): Result<void> {
    this.isActive = status;
    return Result.ok();
  }

  setName(name: string): Result<void> {
    this.name = name;
    return Result.ok();
  }

  setParentId(parentId: string | null): Result<void> {
    this.parentId = parentId;
    return Result.ok();
  }

  getRejectionReason(): string | null {
    return this.rejectionReason ?? null;
  }

  getSubmittedBy(): string {
    return this.submittedBy;
  }

  rejectAuctionCategory(reason: string): Result<void> {
    if (this.status !== AuctionCategoryStatus.PENDING) {
      return Result.fail('Only PENDING auction category can be rejected');
    }

    this.status = AuctionCategoryStatus.REJECTED;
    this.rejectionReason = reason;
    return Result.ok();
  }
}

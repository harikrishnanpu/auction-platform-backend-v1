import { Result } from '@domain/shared/result';

export enum FraudReportSource {
    MANUAL = 'MANUAL',
    SYSTEM = 'SYSTEM',
}

export enum FraudReporterType {
    USER = 'USER',
    SELLER = 'SELLER',
    SYSTEM = 'SYSTEM',
}

export enum FraudReportCategory {
    AUCTION_FRAUD_CRITICAL = 'AUCTION_FRAUD_CRITICAL',
    PAYMENT_CRITICAL = 'PAYMENT_CRITICAL',
    OTHER = 'OTHER',
}

export enum FraudReportLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    CRITICAL = 'CRITICAL',
}

export enum FraudReportStatus {
    OPEN = 'OPEN',
    UNDER_REVIEW = 'UNDER_REVIEW',
    RESOLVED = 'RESOLVED',
}

export enum FraudAdminDecision {
    NO_ACTION = 'NO_ACTION',
    FAULT_VERIFIED = 'FAULT_VERIFIED',
}

export class FraudReport {
    private constructor(
        private readonly id: string,
        private readonly reportedUserId: string,
        private readonly targetedUserId: string,
        private readonly reporterType: FraudReporterType,
        private readonly source: FraudReportSource,
        private readonly category: FraudReportCategory,
        private readonly level: FraudReportLevel,
        private readonly reason: string,
        private status: FraudReportStatus,
        private adminDecision: FraudAdminDecision | null,
        private reviewedById: string | null,
        private reviewedAt: Date | null,
        private readonly createdAt: Date,
    ) {}

    static create(input: {
        id: string;
        reportedUserId: string;
        targetedUserId: string;
        reporterType: FraudReporterType;
        source?: FraudReportSource;
        category: FraudReportCategory;
        level: FraudReportLevel;
        reason: string;
        status?: FraudReportStatus;
        adminDecision?: FraudAdminDecision | null;
        reviewedById?: string | null;
        reviewedAt?: Date | null;
        createdAt?: Date;
    }): Result<FraudReport> {
        return Result.ok(
            new FraudReport(
                input.id,
                input.reportedUserId,
                input.targetedUserId,
                input.reporterType,
                input.source ?? FraudReportSource.MANUAL,
                input.category,
                input.level,
                input.reason,
                input.status ?? FraudReportStatus.OPEN,
                input.adminDecision ?? null,
                input.reviewedById ?? null,
                input.reviewedAt ?? null,
                input.createdAt ?? new Date(),
            ),
        );
    }

    markUnderReview() {
        if (this.status === FraudReportStatus.OPEN) {
            this.status = FraudReportStatus.UNDER_REVIEW;
        }
    }

    resolve(reviewedById: string, decision: FraudAdminDecision) {
        this.status = FraudReportStatus.RESOLVED;
        this.adminDecision = decision;
        this.reviewedById = reviewedById;
        this.reviewedAt = new Date();
    }

    getId() {
        return this.id;
    }

    getReportedUserId() {
        return this.reportedUserId;
    }
    getTargetedUserId() {
        return this.targetedUserId;
    }
    getReporterType() {
        return this.reporterType;
    }
    getSource() {
        return this.source;
    }
    getCategory() {
        return this.category;
    }
    getLevel() {
        return this.level;
    }
    getReason() {
        return this.reason;
    }
    getStatus() {
        return this.status;
    }
    getAdminDecision() {
        return this.adminDecision;
    }
    getReviewedById() {
        return this.reviewedById;
    }
    getReviewedAt() {
        return this.reviewedAt;
    }
    getCreatedAt() {
        return this.createdAt;
    }
}

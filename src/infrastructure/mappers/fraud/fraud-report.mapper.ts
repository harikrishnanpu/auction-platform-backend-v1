import {
    FraudAdminDecision,
    FraudReport,
    FraudReportCategory,
    FraudReportLevel,
    FraudReportSource,
    FraudReportStatus,
    FraudReporterType,
} from '@domain/entities/fraud/fraud-report.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { FraudReport as PrismaFraudReport } from '@prisma/client';

export class FraudReportMapper implements IDbMapper<
    FraudReport,
    PrismaFraudReport
> {
    toDomain(raw: PrismaFraudReport): Result<FraudReport> {
        return FraudReport.create({
            id: raw.id,
            reportedUserId: raw.reportedUserId,
            targetedUserId: raw.targetedUserId,
            reporterType: raw.reporterType as FraudReporterType,
            source: raw.source as FraudReportSource,
            category: raw.category as FraudReportCategory,
            level: raw.level as FraudReportLevel,
            reason: raw.reason,
            status: raw.status as FraudReportStatus,
            adminDecision: raw.adminDecision as FraudAdminDecision | null,
            reviewedById: raw.reviewedById,
            reviewedAt: raw.reviewedAt,
            createdAt: raw.createdAt,
        });
    }

    toPersistence(entity: FraudReport): unknown {
        return {
            id: entity.getId(),
            reportedUserId: entity.getReportedUserId(),
            targetedUserId: entity.getTargetedUserId(),
            reporterType: entity.getReporterType(),
            source: entity.getSource(),
            category: entity.getCategory(),
            level: entity.getLevel(),
            reason: entity.getReason(),
            status: entity.getStatus(),
            adminDecision: entity.getAdminDecision(),
            reviewedById: entity.getReviewedById(),
            reviewedAt: entity.getReviewedAt(),
            createdAt: entity.getCreatedAt(),
        };
    }
}

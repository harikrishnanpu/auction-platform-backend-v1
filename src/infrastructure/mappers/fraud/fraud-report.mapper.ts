import {
    FraudAdminDecision,
    FraudReport,
    FraudReportCategory,
    FraudReportLevel,
    FraudReportSource,
    FraudReportStatus,
    FraudReporterType,
} from '@domain/entities/fraud/fraud-report.entity';
import { User, UserStatus } from '@domain/entities/user/user.entity';
import { User as PrismaUser } from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { FraudReport as PrismaFraudReport } from '@prisma/client';
import { Email } from '@domain/value-objects/email.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';

export type PrismaFraudReportWithUsers = PrismaFraudReport & {
    reportedUser: PrismaUser;
    targetedUser: PrismaUser;
    reviewedBy: PrismaUser | null;
};

export class FraudReportMapper implements IDbMapper<
    FraudReport,
    PrismaFraudReport
> {
    toDomain(raw: PrismaFraudReportWithUsers): Result<FraudReport> {
        const reportedUserResult = User.create({
            id: raw.reportedUserId,
            name: raw.reportedUser.name,
            email: Email.create(raw.reportedUser.email).getValue(),
            phone: Phone.create(raw.reportedUser.phone ?? '').getValue(),
            address: raw.reportedUser.address,
            avatar_url: raw.reportedUser.avatar_url,
            authProvider: AuthProvider.createLocal(
                raw.reportedUser.password ?? '',
            ).getValue(),
            roles: [UserRole.USER],
            status: raw.reportedUser.status as UserStatus,
        });

        const targetedUserResult = User.create({
            id: raw.targetedUserId,
            name: raw.targetedUser.name,
            email: Email.create(raw.targetedUser.email).getValue(),
            phone: Phone.create(raw.targetedUser.phone ?? '').getValue(),
            address: raw.targetedUser.address,
            avatar_url: raw.targetedUser.avatar_url,
            authProvider: AuthProvider.createLocal(
                raw.targetedUser.password ?? '',
            ).getValue(),
            roles: [UserRole.USER],
            status: raw.targetedUser.status as UserStatus,
        });

        const reviewedByResult = raw.reviewedBy
            ? User.create({
                  id: raw.reviewedBy.id,
                  name: raw.reviewedBy.name,
                  email: Email.create(raw.reviewedBy.email).getValue(),
                  phone: Phone.create(raw.reviewedBy.phone ?? '').getValue(),
                  address: raw.reviewedBy.address,
                  avatar_url: raw.reviewedBy.avatar_url,
                  authProvider: AuthProvider.createLocal(
                      raw.reviewedBy.password ?? '',
                  ).getValue(),
                  roles: [UserRole.USER],
                  status: raw.reviewedBy.status as UserStatus,
              })
            : null;

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
            reportedUser: reportedUserResult.getValue(),
            targetedUser: targetedUserResult.getValue(),
            reviewedBy: reviewedByResult?.getValue() ?? null,
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

import { TYPES } from '@di/types.di';
import {
    FraudAdminDecision,
    FraudReport,
    FraudReportLevel,
    FraudReportStatus,
} from '@domain/entities/fraud/fraud-report.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import {
    IFraudReportRepository,
    IFindFraudReportsFilters,
} from '@domain/repositories/IFraudReportRepository';
import { Result } from '@domain/shared/result';
import { PrismaClient, FraudReport as PrismaFraudReport } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';

@injectable()
export class PrismaFraudReportRepository
    extends BaseRepository<
        FraudReport,
        PrismaFraudReport,
        IFindFraudReportsFilters,
        IDbMapper<FraudReport, PrismaFraudReport>
    >
    implements IFraudReportRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.FraudReportMapper)
        readonly mapper: IDbMapper<FraudReport, PrismaFraudReport>,
    ) {
        super(_prisma.fraudReport, mapper);
    }

    async findAll(
        filters: IFindFraudReportsFilters,
    ): Promise<Result<FraudReport[]>> {
        const where = {
            status: filters.status as FraudReportStatus,
            ...(filters.search && {
                // -- prisma OR but here $or --- change
                $or: [
                    {
                        reportedUser: {
                            name: {
                                contains: filters.search,
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        targetedUser: {
                            name: {
                                contains: filters.search,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            }),
        };

        const rows = await this._prisma.fraudReport.findMany({
            where,
            orderBy: { [filters.sort]: filters.order },
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
            include: {
                reportedUser: true,
                targetedUser: true,
                reviewedBy: true,
            },
        });

        const reports: FraudReport[] = [];
        for (const row of rows) {
            const mapped = this.mapper.toDomain(row);
            if (mapped.isFailure) return Result.fail(mapped.getError());
            reports.push(mapped.getValue());
        }

        return Result.ok(reports);
    }

    async updateReview(input: {
        reportId: string;
        reviewedById: string;
        decision: FraudAdminDecision;
        status: FraudReportStatus;
    }): Promise<Result<FraudReport>> {
        try {
            const updated = await this._prisma.fraudReport.update({
                where: { id: input.reportId },
                data: {
                    adminDecision: input.decision,
                    status: input.status,
                    reviewedById: input.reviewedById,
                    reviewedAt: new Date(),
                },
            });
            return this.mapper.toDomain(updated);
        } catch (error) {
            console.log(error);
            return Result.fail('Failed to update report');
        }
    }

    async updateStatus(input: {
        reportId: string;
        status: FraudReportStatus;
    }): Promise<Result<FraudReport>> {
        try {
            const updated = await this._prisma.fraudReport.update({
                where: { id: input.reportId },
                data: { status: input.status },
            });
            return this.mapper.toDomain(updated);
        } catch (error) {
            console.log(error);
            return Result.fail('Failed to update status');
        }
    }

    async updateReport(report: FraudReport): Promise<Result<FraudReport>> {
        try {
            const persistence = this.mapper.toPersistence(
                report,
            ) as PrismaFraudReport;
            const updated = await this._prisma.fraudReport.update({
                where: { id: report.getId() },
                data: {
                    reportedUserId: persistence.reportedUserId,
                    targetedUserId: persistence.targetedUserId,
                    reporterType: persistence.reporterType,
                    source: persistence.source,
                    category: persistence.category,
                    level: persistence.level,
                    reason: persistence.reason,
                    status: persistence.status,
                    adminDecision: persistence.adminDecision,
                    reviewedById: persistence.reviewedById,
                    reviewedAt: persistence.reviewedAt,
                },
            });
            return this.mapper.toDomain(updated);
        } catch (error) {
            return Result.fail(
                error instanceof Error
                    ? error.message
                    : 'Failed to update report',
            );
        }
    }

    async getVerifiedFaultScore(userId: string): Promise<Result<number>> {
        try {
            const reports = await this._prisma.fraudReport.findMany({
                where: {
                    targetedUserId: userId,
                    adminDecision: 'FAULT_VERIFIED',
                    status: 'RESOLVED',
                },
                select: { level: true },
            });
            const score = reports.reduce((acc, report) => {
                if (report.level === 'CRITICAL') return acc + 3;
                if (report.level === 'MEDIUM') return acc + 2;
                return acc + 1;
            }, 0);
            return Result.ok(score);
        } catch (error) {
            console.log(error);
            return Result.fail('Failed to calculate score');
        }
    }

    async findResolvedFaultCount(userId: string): Promise<Result<number>> {
        const count = await this._prisma.fraudReport.count({
            where: {
                targetedUserId: userId,
                adminDecision: 'FAULT_VERIFIED',
                status: 'RESOLVED',
            },
        });
        return Result.ok(count);
    }

    async countByUserAndLevel(
        userId: string,
        level: FraudReportLevel,
    ): Promise<Result<number>> {
        const count = await this._prisma.fraudReport.count({
            where: {
                targetedUserId: userId,
                level,
                status: 'RESOLVED',
                adminDecision: 'FAULT_VERIFIED',
            },
        });
        return Result.ok(count);
    }
}

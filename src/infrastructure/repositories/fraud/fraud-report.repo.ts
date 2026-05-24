import { TYPES } from '@di/types.di';
import { FraudReport } from '@domain/entities/fraud/fraud-report.entity';
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

    async save(report: FraudReport): Promise<Result<FraudReport>> {
        try {
            const persistence = this.mapper.toPersistence(
                report,
            ) as PrismaFraudReport;
            const created = await this._prisma.fraudReport.create({
                data: persistence,
                include: {
                    reportedUser: true,
                    targetedUser: true,
                    reviewedBy: true,
                },
            });
            return this.mapper.toDomain(created);
        } catch (error) {
            console.log(error);
            return Result.fail('Failed to save report');
        }
    }

    async findById(id: string): Promise<Result<FraudReport | null>> {
        const row = await this._prisma.fraudReport.findUnique({
            where: { id },
            include: {
                reportedUser: true,
                targetedUser: true,
                reviewedBy: true,
            },
        });
        if (!row) return Result.ok(null);
        return this.mapper.toDomain(row);
    }

    async count(filters: IFindFraudReportsFilters): Promise<Result<number>> {
        try {
            const total = await this._prisma.fraudReport.count({
                where: {
                    ...(filters.status ? { status: filters.status } : {}),
                    ...(filters.search
                        ? {
                              OR: [
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
                                  {
                                      reason: {
                                          contains: filters.search,
                                          mode: 'insensitive',
                                      },
                                  },
                              ],
                          }
                        : {}),
                },
            });
            return Result.ok(total);
        } catch {
            return Result.fail('Failed to count reports');
        }
    }

    async findAll(
        filters: IFindFraudReportsFilters,
    ): Promise<Result<FraudReport[]>> {
        try {
            const rows = await this._prisma.fraudReport.findMany({
                where: {
                    ...(filters.status ? { status: filters.status } : {}),
                    ...(filters.search
                        ? {
                              OR: [
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
                                  {
                                      reason: {
                                          contains: filters.search,
                                          mode: 'insensitive',
                                      },
                                  },
                              ],
                          }
                        : {}),
                },
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
        } catch (error) {
            console.log(error);
            return Result.fail('Failed to get reports');
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
                include: {
                    reportedUser: true,
                    targetedUser: true,
                    reviewedBy: true,
                },
            });
            return this.mapper.toDomain(updated);
        } catch (error) {
            console.log(error);
            return Result.fail('Failed to update report');
        }
    }

    async findAllTodayReportsByTragetedUserId(
        userId: string,
    ): Promise<Result<FraudReport[]>> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const rawResult = await this._prisma.fraudReport.findMany({
            where: {
                targetedUserId: userId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                reportedUser: true,
                targetedUser: true,
                reviewedBy: true,
            },
        });

        const result: FraudReport[] = [];

        for (const raw of rawResult) {
            const entity = this.mapper.toDomain(raw);
            if (entity.isFailure) return Result.fail(entity.getError());
            result.push(entity.getValue());
        }

        return Result.ok(result);
    }
}

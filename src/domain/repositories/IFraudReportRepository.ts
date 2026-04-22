import {
    FraudAdminDecision,
    FraudReport,
    FraudReportLevel,
    FraudReportStatus,
} from '@domain/entities/fraud/fraud-report.entity';
import { Result } from '@domain/shared/result';

export interface IFindFraudReportsFilters {
    page: number;
    limit: number;
    search: string;
    status?: FraudReportStatus;
    sort: 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
}

export interface IFraudReportRepository {
    save(report: FraudReport): Promise<Result<FraudReport>>;
    findById(id: string): Promise<Result<FraudReport | null>>;
    findAll(filters: IFindFraudReportsFilters): Promise<Result<FraudReport[]>>;

    updateReview(input: {
        reportId: string;
        reviewedById: string;
        decision: FraudAdminDecision;
        status: FraudReportStatus;
    }): Promise<Result<FraudReport>>;
    updateStatus(input: {
        reportId: string;
        status: FraudReportStatus;
    }): Promise<Result<FraudReport>>;
    updateReport(report: FraudReport): Promise<Result<FraudReport>>;
    getVerifiedFaultScore(userId: string): Promise<Result<number>>;
    findResolvedFaultCount(userId: string): Promise<Result<number>>;
    countByUserAndLevel(
        userId: string,
        level: FraudReportLevel,
    ): Promise<Result<number>>;
}

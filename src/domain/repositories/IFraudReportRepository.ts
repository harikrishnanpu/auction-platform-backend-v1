import {
    FraudReport,
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
    count(filters: IFindFraudReportsFilters): Promise<Result<number>>;
    updateReport(report: FraudReport): Promise<Result<FraudReport>>;
    findAllTodayReportsByTragetedUserId(
        userId: string,
    ): Promise<Result<FraudReport[]>>;
}

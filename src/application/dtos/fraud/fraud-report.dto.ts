import {
    FraudAdminDecision,
    FraudReportCategory,
    FraudReportLevel,
    FraudReportSource,
    FraudReportStatus,
    FraudReporterType,
} from '@domain/entities/fraud/fraud-report.entity';
import { SuspensionType } from '@domain/entities/fraud/user-suspension.entity';

export interface ICreateFraudReportInputDto {
    reportedUserId: string;
    targetedUserId: string;
    reportedUserType: FraudReporterType;
    source?: FraudReportSource;
    category: FraudReportCategory;
    level: FraudReportLevel;
    reason: string;
}

export interface IFraudReportOutputDto {
    id: string;
    reportedUserId: string;
    reportedUserName?: string | null;
    targetedUserId: string;
    targetedUserName?: string | null;
    reporterType: FraudReporterType;
    source: FraudReportSource;
    category: FraudReportCategory;
    level: FraudReportLevel;
    reason: string;
    status: FraudReportStatus;
    adminDecision: FraudAdminDecision | null;
    reviewedById: string | null;
    reviewedAt: Date | null;
    createdAt: Date;
}

export interface IGetFraudReportsInputDto {
    page: number;
    limit: number;
    search: string;
    status?: FraudReportStatus;
    sort: 'createdAt' | 'updatedAt';
    order: 'asc' | 'desc';
}

export interface IGetFraudReportsOutputDto {
    reports: IFraudReportOutputDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IReviewFraudReportInputDto {
    reportId: string;
    adminUserId: string;
    decision: FraudAdminDecision;
    note?: string;
}

export interface IUpdateFraudReportInputDto {
    reportId: string;
    category?: FraudReportCategory;
    status?: FraudReportStatus;
    decision?: FraudAdminDecision | null;
    reporterType?: FraudReporterType;
    source?: FraudReportSource;
    level?: FraudReportLevel;
}

export interface IMarkFraudReportUnderReviewInputDto {
    reportId: string;
    adminUserId: string;
}

export interface ISuspendedUserOutputDto {
    userId: string;
    userName: string;
    email: string;
    status: string;
    activeSuspensionType: string;
    activeSuspensionEndsAt: Date | null;
}

export interface IGetSuspendedUsersInputDto {
    page: number;
    limit: number;
    search: string;
}

export interface IGetSuspendedUsersOutputDto {
    users: ISuspendedUserOutputDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ISuspensionUserItemDto {
    id: string;
    userId: string;
    reportId: string | null;
    type: SuspensionType;
    reason: string;
    startsAt: Date;
    endsAt: Date | null;
    isActive: boolean;
    createdAt: Date;
}

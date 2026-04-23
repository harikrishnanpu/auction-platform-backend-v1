import { ICreateFraudReportUsecase } from '@application/interfaces/usecases/fraud/ICreateFraudReportUsecase';
import { IGetFraudReportsUsecase } from '@application/interfaces/usecases/fraud/IGetFraudReportsUsecase';
import { IGetSuspendedUsersUsecase } from '@application/interfaces/usecases/fraud/IGetSuspendedUsersUsecase';
import { IReviewFraudReportUsecase } from '@application/interfaces/usecases/fraud/IReviewFraudReportUsecase';
import { IMarkFraudReportUnderReviewUsecase } from '@application/interfaces/usecases/fraud/IMarkFraudReportUnderReviewUsecase';
import { IUpdateFraudReportUsecase } from '@application/interfaces/usecases/fraud/IUpdateFraudReportUsecase';
import { CreateFraudReportUsecase } from '@application/usecases/fraud/createFraudReport.usecase';
import { GetFraudReportsUsecase } from '@application/usecases/fraud/getFraudReports.usecase';
import { GetSuspendedUsersUsecase } from '@application/usecases/fraud/getSuspendedUsers.usecase';
import { ReviewFraudReportUsecase } from '@application/usecases/fraud/reviewFraudReport.usecase';
import { MarkFraudReportUnderReviewUsecase } from '@application/usecases/fraud/markFraudReportUnderReview.usecase';
import { UpdateFraudReportUsecase } from '@application/usecases/fraud/updateFraudReport.usecase';
import { TYPES } from '@di/types.di';
import { IFraudReportRepository } from '@domain/repositories/IFraudReportRepository';
import { IUserSuspensionRepository } from '@domain/repositories/IUserSuspensionRepository';
import { PrismaUserSuspensionRepository } from '@infrastructure/repositories/fraud/user-suspension.repo';
import { ContainerModule } from 'inversify';
import { PrismaFraudReportRepository } from '@infrastructure/repositories/fraud/fraud-report.repo';
import { IGetSuspensionUsersUsecase } from '@application/interfaces/usecases/fraud/IGetSuspensionTimelineUsecase';
import { GetSuspensionUsersUsecase } from '@application/usecases/fraud/getSuspensionUsers.usecase';

export const fraudContainer = new ContainerModule(({ bind }) => {
    bind<IFraudReportRepository>(TYPES.IFraudReportRepository).to(
        PrismaFraudReportRepository,
    );
    bind<IUserSuspensionRepository>(TYPES.IUserSuspensionRepository).to(
        PrismaUserSuspensionRepository,
    );
    bind<ICreateFraudReportUsecase>(TYPES.ICreateFraudReportUsecase).to(
        CreateFraudReportUsecase,
    );
    bind<IGetFraudReportsUsecase>(TYPES.IGetFraudReportsUsecase).to(
        GetFraudReportsUsecase,
    );
    bind<IReviewFraudReportUsecase>(TYPES.IReviewFraudReportUsecase).to(
        ReviewFraudReportUsecase,
    );
    bind<IMarkFraudReportUnderReviewUsecase>(
        TYPES.IMarkFraudReportUnderReviewUsecase,
    ).to(MarkFraudReportUnderReviewUsecase);
    bind<IUpdateFraudReportUsecase>(TYPES.IUpdateFraudReportUsecase).to(
        UpdateFraudReportUsecase,
    );
    bind<IGetSuspendedUsersUsecase>(TYPES.IGetSuspendedUsersUsecase).to(
        GetSuspendedUsersUsecase,
    );
    bind<IGetSuspensionUsersUsecase>(TYPES.IGetSuspensionUsersUsecase).to(
        GetSuspensionUsersUsecase,
    );
});

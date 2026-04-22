import {
    ICreateFraudReportInputDto,
    IFraudReportOutputDto,
} from '@application/dtos/fraud/fraud-report.dto';
import { ICreateFraudReportUsecase } from '@application/interfaces/usecases/fraud/ICreateFraudReportUsecase';
import { TYPES } from '@di/types.di';
import { FraudReport } from '@domain/entities/fraud/fraud-report.entity';
import { IFraudReportRepository } from '@domain/repositories/IFraudReportRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { randomUUID } from 'crypto';

@injectable()
export class CreateFraudReportUsecase implements ICreateFraudReportUsecase {
    constructor(
        @inject(TYPES.IFraudReportRepository)
        private readonly _fraudRepository: IFraudReportRepository,
    ) {}

    async execute(
        input: ICreateFraudReportInputDto,
    ): Promise<Result<IFraudReportOutputDto>> {
        const reportResult = FraudReport.create({
            id: randomUUID(),
            reportedUserId: input.reportedUserId,
            targetedUserId: input.targetedUserId,
            reporterType: input.reporterType,
            source: input.source,
            category: input.category,
            level: input.level,
            reason: input.reason,
        });

        if (reportResult.isFailure) return Result.fail(reportResult.getError());

        const saveResult = await this._fraudRepository.save(
            reportResult.getValue(),
        );
        if (saveResult.isFailure) return Result.fail(saveResult.getError());

        const report = saveResult.getValue();

        return Result.ok({
            id: report.getId(),
            reportedUserId: report.getReportedUserId(),
            targetedUserId: report.getTargetedUserId(),
            reporterType: report.getReporterType(),
            source: report.getSource(),
            category: report.getCategory(),
            level: report.getLevel(),
            reason: report.getReason(),
            status: report.getStatus(),
            adminDecision: report.getAdminDecision(),
            reviewedById: report.getReviewedById(),
            reviewedAt: report.getReviewedAt(),
            createdAt: report.getCreatedAt(),
        });
    }
}

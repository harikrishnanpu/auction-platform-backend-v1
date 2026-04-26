import { IUpdateFraudReportInputDto } from '@application/dtos/fraud/fraud-report.dto';
import { IUpdateFraudReportUsecase } from '@application/interfaces/usecases/fraud/IUpdateFraudReportUsecase';
import { TYPES } from '@di/types.di';
import { FraudReport } from '@domain/entities/fraud/fraud-report.entity';
import { IFraudReportRepository } from '@domain/repositories/IFraudReportRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class UpdateFraudReportUsecase implements IUpdateFraudReportUsecase {
    constructor(
        @inject(TYPES.IFraudReportRepository)
        private readonly _fraudRepository: IFraudReportRepository,
    ) {}

    async execute(input: IUpdateFraudReportInputDto): Promise<Result<null>> {
        const existingReportResult = await this._fraudRepository.findById(
            input.reportId,
        );
        if (existingReportResult.isFailure) {
            return Result.fail(existingReportResult.getError());
        }

        const existingReport = existingReportResult.getValue();
        if (!existingReport) {
            return Result.fail('Fraud report not found');
        }

        const updatedEntityResult = FraudReport.create({
            id: existingReport.getId(),
            reportedUserId: existingReport.getReportedUserId(),
            targetedUserId: existingReport.getTargetedUserId(),
            reporterType:
                input.reporterType ?? existingReport.getReporterType(),
            source: input.source ?? existingReport.getSource(),
            category: input.category ?? existingReport.getCategory(),
            level: input.level ?? existingReport.getLevel(),
            reason: existingReport.getReason(),
            status: input.status ?? existingReport.getStatus(),
            adminDecision:
                input.decision !== undefined
                    ? input.decision
                    : existingReport.getAdminDecision(),
            reviewedById: existingReport.getReviewedById(),
            reviewedAt: existingReport.getReviewedAt(),
            createdAt: existingReport.getCreatedAt(),
            reportedUser: existingReport.getReportedUser(),
            targetedUser: existingReport.getTargetedUser(),
            reviewedBy: existingReport.getReviewedBy(),
        });
        if (updatedEntityResult.isFailure) {
            return Result.fail(updatedEntityResult.getError());
        }

        const result = await this._fraudRepository.updateReport(
            updatedEntityResult.getValue(),
        );
        if (result.isFailure) {
            return Result.fail(result.getError());
        }

        return Result.ok(null);
    }
}

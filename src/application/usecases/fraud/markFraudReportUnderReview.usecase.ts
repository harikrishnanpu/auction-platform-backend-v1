import { IMarkFraudReportUnderReviewInputDto } from '@application/dtos/fraud/fraud-report.dto';
import { IMarkFraudReportUnderReviewUsecase } from '@application/interfaces/usecases/fraud/IMarkFraudReportUnderReviewUsecase';
import { TYPES } from '@di/types.di';
import { IFraudReportRepository } from '@domain/repositories/IFraudReportRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class MarkFraudReportUnderReviewUsecase implements IMarkFraudReportUnderReviewUsecase {
    constructor(
        @inject(TYPES.IFraudReportRepository)
        private readonly _fraudRepository: IFraudReportRepository,
    ) {}

    async execute(
        input: IMarkFraudReportUnderReviewInputDto,
    ): Promise<Result<null>> {
        const reportResult = await this._fraudRepository.findById(
            input.reportId,
        );
        if (reportResult.isFailure) return Result.fail(reportResult.getError());

        const report = reportResult.getValue();
        if (!report) return Result.fail('Fraud report not found');

        report.markUnderReview();
        const result = await this._fraudRepository.updateReport(report);
        if (result.isFailure) return Result.fail(result.getError());
        return Result.ok(null);
    }
}

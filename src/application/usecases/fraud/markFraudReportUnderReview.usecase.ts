import { IMarkFraudReportUnderReviewInputDto } from '@application/dtos/fraud/fraud-report.dto';
import { IMarkFraudReportUnderReviewUsecase } from '@application/interfaces/usecases/fraud/IMarkFraudReportUnderReviewUsecase';
import { TYPES } from '@di/types.di';
import { FraudReportStatus } from '@domain/entities/fraud/fraud-report.entity';
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
        const result = await this._fraudRepository.updateStatus({
            reportId: input.reportId,
            status: FraudReportStatus.UNDER_REVIEW,
        });
        if (result.isFailure) return Result.fail(result.getError());
        return Result.ok(null);
    }
}

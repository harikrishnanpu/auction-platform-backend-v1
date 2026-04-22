import { IMarkFraudReportUnderReviewInputDto } from '@application/dtos/fraud/fraud-report.dto';
import { Result } from '@domain/shared/result';

export interface IMarkFraudReportUnderReviewUsecase {
    execute(input: IMarkFraudReportUnderReviewInputDto): Promise<Result<null>>;
}

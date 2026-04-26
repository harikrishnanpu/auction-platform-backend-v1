import { IReviewFraudReportInputDto } from '@application/dtos/fraud/fraud-report.dto';
import { Result } from '@domain/shared/result';

export interface IReviewFraudReportUsecase {
    execute(input: IReviewFraudReportInputDto): Promise<Result<null>>;
}

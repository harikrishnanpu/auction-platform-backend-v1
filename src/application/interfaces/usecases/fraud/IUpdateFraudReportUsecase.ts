import { IUpdateFraudReportInputDto } from '@application/dtos/fraud/fraud-report.dto';
import { Result } from '@domain/shared/result';

export interface IUpdateFraudReportUsecase {
    execute(input: IUpdateFraudReportInputDto): Promise<Result<null>>;
}

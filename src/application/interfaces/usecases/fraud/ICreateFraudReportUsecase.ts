import {
    ICreateFraudReportInputDto,
    IFraudReportOutputDto,
} from '@application/dtos/fraud/fraud-report.dto';
import { Result } from '@domain/shared/result';

export interface ICreateFraudReportUsecase {
    execute(
        input: ICreateFraudReportInputDto,
    ): Promise<Result<IFraudReportOutputDto>>;
}

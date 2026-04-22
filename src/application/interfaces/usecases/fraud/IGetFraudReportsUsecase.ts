import {
    IGetFraudReportsInputDto,
    IGetFraudReportsOutputDto,
} from '@application/dtos/fraud/fraud-report.dto';
import { Result } from '@domain/shared/result';

export interface IGetFraudReportsUsecase {
    execute(
        input: IGetFraudReportsInputDto,
    ): Promise<Result<IGetFraudReportsOutputDto>>;
}

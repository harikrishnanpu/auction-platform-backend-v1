import {
    IAutoBidConfigOutputDto,
    IDisableAutoBidConfigInputDto,
} from '@application/dtos/auction/autoBidConfig.dto';
import { Result } from '@domain/shared/result';

export interface IDisableAutoBidConfigUsecase {
    execute(
        input: IDisableAutoBidConfigInputDto,
    ): Promise<Result<IAutoBidConfigOutputDto | null>>;
}

import {
    IAutoBidConfigOutputDto,
    IUpdateAutoBidConfigInputDto,
} from '@application/dtos/auction/autoBidConfig.dto';
import { Result } from '@domain/shared/result';

export interface IUpdateAutoBidConfigUsecase {
    execute(
        input: IUpdateAutoBidConfigInputDto,
    ): Promise<Result<IAutoBidConfigOutputDto>>;
}

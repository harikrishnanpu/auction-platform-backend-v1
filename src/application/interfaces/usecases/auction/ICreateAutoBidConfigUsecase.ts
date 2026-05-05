import {
    IAutoBidConfigOutputDto,
    ICreateAutoBidConfigInputDto,
} from '@application/dtos/auction/autoBidConfig.dto';
import { Result } from '@domain/shared/result';

export interface ICreateAutoBidConfigUsecase {
    execute(
        input: ICreateAutoBidConfigInputDto,
    ): Promise<Result<IAutoBidConfigOutputDto>>;
}

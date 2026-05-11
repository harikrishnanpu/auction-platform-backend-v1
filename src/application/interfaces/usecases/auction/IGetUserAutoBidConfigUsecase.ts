import {
    IAutoBidConfigOutputDto,
    IGetUserAutoBidConfigInputDto,
} from '@application/dtos/auction/autoBidConfig.dto';
import { Result } from '@domain/shared/result';

export interface IGetUserAutoBidConfigUsecase {
    execute(
        input: IGetUserAutoBidConfigInputDto,
    ): Promise<Result<IAutoBidConfigOutputDto | null>>;
}

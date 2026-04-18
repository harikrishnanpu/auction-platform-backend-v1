import {
    IGetUserHomeStatsInputDto,
    IGetUserHomeStatsOutputDto,
} from '@application/dtos/user/getUserHomeStats.dto';
import { Result } from '@domain/shared/result';

export interface IGetUserHomeStatsUsecase {
    execute(
        input: IGetUserHomeStatsInputDto,
    ): Promise<Result<IGetUserHomeStatsOutputDto>>;
}

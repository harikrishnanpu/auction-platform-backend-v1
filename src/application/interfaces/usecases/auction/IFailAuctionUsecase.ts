import {
    IFailAuctionInputDto,
    IFailAuctionOutputDto,
} from '@application/dtos/auction/fail-auction.dto';
import { Result } from '@domain/shared/result';

export interface IFailAuctionUsecase {
    execute(
        input: IFailAuctionInputDto,
    ): Promise<Result<IFailAuctionOutputDto>>;
}

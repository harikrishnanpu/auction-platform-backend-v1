import type {
    IGetAuctionBidsInputDto,
    IGetAuctionBidsOutputDto,
} from '@application/dtos/auction/getAuctionBids.dto';
import { Result } from '@domain/shared/result';

export interface IGetAuctionBidsUsecase {
    execute(
        input: IGetAuctionBidsInputDto,
    ): Promise<Result<IGetAuctionBidsOutputDto>>;
}

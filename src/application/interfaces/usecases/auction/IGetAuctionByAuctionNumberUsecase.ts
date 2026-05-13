import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { IGetAuctionByAuctionNumberInputDto } from '@application/dtos/auction/getAuctionByAuctionNumber.dto';
import { Result } from '@domain/shared/result';

export interface IGetAuctionByAuctionNumberUsecase {
    execute(
        input: IGetAuctionByAuctionNumberInputDto,
    ): Promise<Result<IAuctionDto>>;
}

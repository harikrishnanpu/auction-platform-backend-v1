import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { IGetAuctionByIdInputDto } from '@application/dtos/auction/getAuctionById.dto';
import { Result } from '@domain/shared/result';

export interface IGetAuctionByIdUsecase {
  execute(input: IGetAuctionByIdInputDto): Promise<Result<IAuctionDto>>;
}

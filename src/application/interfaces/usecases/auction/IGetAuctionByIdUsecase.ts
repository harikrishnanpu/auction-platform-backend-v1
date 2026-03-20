import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { Result } from '@domain/shared/result';

export interface IGetAuctionByIdInputDto {
  userId: string;
  auctionId: string;
}

export interface IGetAuctionByIdUsecase {
  execute(input: IGetAuctionByIdInputDto): Promise<Result<IAuctionDto>>;
}

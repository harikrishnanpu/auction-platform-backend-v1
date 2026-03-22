import { ICreateAuctionInputDto } from '@application/dtos/auction/create-auction.dto';
import { Result } from '@domain/shared/result';

export interface IAuctionCreateStrategy {
  validate(data: ICreateAuctionInputDto): Result<ICreateAuctionInputDto>;
}

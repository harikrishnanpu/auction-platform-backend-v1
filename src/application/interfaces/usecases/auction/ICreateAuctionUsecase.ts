import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { ICreateAuctionInputDto } from '@application/dtos/auction/create-auction.dto';
import { Result } from '@domain/shared/result';

export interface ICreateAuctionUsecase {
    execute(input: ICreateAuctionInputDto): Promise<Result<IAuctionDto>>;
}

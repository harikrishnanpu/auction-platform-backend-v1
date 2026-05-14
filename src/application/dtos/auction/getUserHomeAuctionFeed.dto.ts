import { IAuctionDto } from './auction.dto';

export interface IGetUserHomeAuctionFeedOutputDto {
    liveAuctions: IAuctionDto[];
    longAndSealedAuctions: IAuctionDto[];
}

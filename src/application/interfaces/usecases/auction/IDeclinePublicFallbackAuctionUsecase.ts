import {
    IDeclinePublicFallbackAuctionInputDto,
    IDeclinePublicFallbackAuctionOutputDto,
} from '@application/dtos/auction/declinePublicFallbackAuction.dto';
import { Result } from '@domain/shared/result';

export interface IDeclinePublicFallbackAuctionUsecase {
    execute(
        input: IDeclinePublicFallbackAuctionInputDto,
    ): Promise<Result<IDeclinePublicFallbackAuctionOutputDto>>;
}

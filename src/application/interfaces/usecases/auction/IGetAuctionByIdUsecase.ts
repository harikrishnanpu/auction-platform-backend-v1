import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import { Result } from '@domain/shared/result';

export interface IGetAuctionByIdUsecase {
    execute(data: {
        auctionId: string;
        userId: string;
    }): Promise<Result<IAuctionDto>>;
}

import {
    IGetSellerAuctionPaymentsInputDto,
    IGetSellerAuctionPaymentsOutputDto,
} from '@application/dtos/seller/sellerAuctionPayments.dto';
import { Result } from '@domain/shared/result';

export interface IGetSellerAuctionPaymentsUsecase {
    execute(
        input: IGetSellerAuctionPaymentsInputDto,
    ): Promise<Result<IGetSellerAuctionPaymentsOutputDto>>;
}

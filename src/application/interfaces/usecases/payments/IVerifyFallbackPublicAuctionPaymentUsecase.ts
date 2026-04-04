import {
    IVerifyPublicFallbackAuctionPaymentInputDto,
    IVerifyPublicFallbackAuctionPaymentOutputDto,
} from '@application/dtos/payments/verify-public-fallback-auction-payment.dto';
import { Result } from '@domain/shared/result';

export interface IVerifyFallbackPublicAuctionPaymentUsecase {
    execute(
        input: IVerifyPublicFallbackAuctionPaymentInputDto,
    ): Promise<Result<IVerifyPublicFallbackAuctionPaymentOutputDto>>;
}

import {
    ICreatePaymentOrderForPublicFallbackAuctionInputDto,
    ICreatePaymentOrderForPublicFallbackAuctionOutputDto,
} from '@application/dtos/payments/create-payment-order-for-public-fallback-auction.dto';
import { Result } from '@domain/shared/result';

export interface ICreatePaymentOrderForPublicFallbackAuctionUsecase {
    execute(
        input: ICreatePaymentOrderForPublicFallbackAuctionInputDto,
    ): Promise<Result<ICreatePaymentOrderForPublicFallbackAuctionOutputDto>>;
}

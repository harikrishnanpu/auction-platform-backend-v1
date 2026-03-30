import { ICreatePendingPaymentForAuctionInputDto } from '@application/dtos/payments/payment.dto';
import { Result } from '@domain/shared/result';

export interface ICreatePendingPaymentForAuctionUsecase {
    execute(
        input: ICreatePendingPaymentForAuctionInputDto,
    ): Promise<Result<void>>;
}

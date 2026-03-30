import { IVerifyPaymentInputDto } from '@application/dtos/payments/payment.dto';
import { Result } from '@domain/shared/result';

export interface IVerifyPaymentUsecase {
    execute(input: IVerifyPaymentInputDto): Promise<Result<void>>;
}

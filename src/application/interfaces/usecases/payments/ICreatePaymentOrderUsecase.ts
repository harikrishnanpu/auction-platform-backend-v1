import {
    ICreatePaymentOrderInputDto,
    ICreatePaymentOrderOutputDto,
} from '@application/dtos/payments/payment.dto';
import { Result } from '@domain/shared/result';

export interface ICreatePaymentOrderUsecase {
    execute(
        input: ICreatePaymentOrderInputDto,
    ): Promise<Result<ICreatePaymentOrderOutputDto>>;
}

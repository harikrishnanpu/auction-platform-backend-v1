import {
    IGetUserPaymentsInputDto,
    IGetUserPaymentsOutputDto,
} from '@application/dtos/payments/payment.dto';
import { Result } from '@domain/shared/result';

export interface IGetUserPaymentsUsecase {
    execute(
        input: IGetUserPaymentsInputDto,
    ): Promise<Result<IGetUserPaymentsOutputDto>>;
}

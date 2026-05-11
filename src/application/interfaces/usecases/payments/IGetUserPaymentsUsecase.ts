import { IGetUserPaymentsOutputDto } from '@application/dtos/payments/payment.dto';
import { PaymentStatus } from '@domain/entities/payments/payments.entity';
import { Result } from '@domain/shared/result';

export interface IValidatedGetUserPaymentsInput {
    userId: string;
    status?: PaymentStatus | 'ALL';
    page: number;
    limit: number;
}

export interface IGetUserPaymentsUsecase {
    execute(
        input: IValidatedGetUserPaymentsInput,
    ): Promise<Result<IGetUserPaymentsOutputDto>>;
}

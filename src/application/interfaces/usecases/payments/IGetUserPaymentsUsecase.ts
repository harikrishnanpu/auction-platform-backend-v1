import { IGetUserPaymentsOutputDto } from '@application/dtos/payments/payment.dto';
import { Result } from '@domain/shared/result';
import { ZodGetUsersPaymentsInputType } from '@presentation/validators/schemas/payments/getUsersPayments.schema';

export interface IGetUserPaymentsUsecase {
    execute(
        input: ZodGetUsersPaymentsInputType,
    ): Promise<Result<IGetUserPaymentsOutputDto>>;
}

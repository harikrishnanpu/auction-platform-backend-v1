import {
    IGetUserPaymentsInputDto,
    IGetUserPaymentsOutputDto,
} from '@application/dtos/payments/payment.dto';
import { IGetUserPaymentsUsecase } from '@application/interfaces/usecases/payments/IGetUserPaymentsUsecase';
import { PaymentsMapperProfile } from '@application/mappers/payments/paymentsProfile.mapper';
import { TYPES } from '@di/types.di';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetUserPaymentsUsecase implements IGetUserPaymentsUsecase {
    constructor(
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
    ) {}

    async execute(
        input: IGetUserPaymentsInputDto,
    ): Promise<Result<IGetUserPaymentsOutputDto>> {
        const paymentsResult = await this._paymentRepository.findByUserId(
            input.userId,
            {
                status: input.status,
                page: input.page,
                limit: input.limit,
            },
        );

        if (paymentsResult.isFailure) {
            return Result.fail(paymentsResult.getError());
        }

        const payments = paymentsResult.getValue().payments;
        const total = paymentsResult.getValue().total;

        const totalPages = Math.ceil(total / input.limit) ?? 1;

        const items = payments.map((payment) => {
            return PaymentsMapperProfile.toGetUserPaymentsOutputDto(payment);
        });

        return Result.ok({
            items,
            page: input.page,
            limit: input.limit,
            total,
            totalPages,
        });
    }
}

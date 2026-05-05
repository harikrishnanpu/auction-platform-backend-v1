import { IGetUserPaymentsOutputDto } from '@application/dtos/payments/payment.dto';
import {
    IGetUserPaymentsUsecase,
    IValidatedGetUserPaymentsInput,
} from '@application/interfaces/usecases/payments/IGetUserPaymentsUsecase';

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
        input: IValidatedGetUserPaymentsInput,
    ): Promise<Result<IGetUserPaymentsOutputDto>> {
        const dto = PaymentsMapperProfile.toGetUserPaymentsInput(input);

        const paymentsResult = await this._paymentRepository.findByUserId(
            dto.userId,
            {
                status: dto.status,
                page: dto.page,
                limit: dto.limit,
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

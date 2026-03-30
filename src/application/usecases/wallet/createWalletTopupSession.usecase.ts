import {
    ICreateWalletTopupSessionInputDto,
    ICreateWalletTopupSessionOutputDto,
} from '@application/dtos/wallet/createWalletTopupSession.dto';
import { IPaymentGatewayService } from '@application/interfaces/services/IPaymentGatewayService';
import { ICreateWalletTopupSessionUsecase } from '@application/interfaces/usecases/wallet/ICreateWalletTopupSessionUsecase';
import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class CreateWalletTopupSessionUsecase implements ICreateWalletTopupSessionUsecase {
    constructor(
        @inject(TYPES.IPaymentGatewayService)
        private readonly _paymentGatewayService: IPaymentGatewayService,
    ) {}

    async execute(
        input: ICreateWalletTopupSessionInputDto,
    ): Promise<Result<ICreateWalletTopupSessionOutputDto>> {
        const orderResult = await this._paymentGatewayService.createOrder({
            userId: input.userId,
            amount: input.amount,
        });

        if (orderResult.isFailure) {
            return Result.fail(orderResult.getError());
        }

        return Result.ok(orderResult.getValue());
    }
}

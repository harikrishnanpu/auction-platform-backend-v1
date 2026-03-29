import { IConfirmWalletTopupInputDto } from '@application/dtos/wallet/confirmWalletTopup.dto';
import { IWalletOutputDto } from '@application/dtos/wallet/wallet.dto';
import { IPaymentGatewayService } from '@application/interfaces/services/IPaymentGatewayService';
import { ICreditWalletUsecase } from '@application/interfaces/usecases/wallet/ICreditWalletUsecase';
import { IConfirmWalletTopupUsecase } from '@application/interfaces/usecases/wallet/IConfirmWalletTopupUsecase';
import { Result } from '@domain/shared/result';
import { injectable, inject } from 'inversify';
import { TYPES } from '@di/types.di';

@injectable()
export class ConfirmWalletTopupUsecase implements IConfirmWalletTopupUsecase {
    constructor(
        @inject(TYPES.ICreditWalletUsecase)
        private readonly _creditWalletUsecase: ICreditWalletUsecase,
        @inject(TYPES.IPaymentGatewayService)
        private readonly _paymentGatewayService: IPaymentGatewayService,
    ) {}

    async execute(
        input: IConfirmWalletTopupInputDto,
    ): Promise<Result<IWalletOutputDto>> {
        const verifyResult = await this._paymentGatewayService.verifyPayment({
            userId: input.userId,
            orderId: input.orderId,
            paymentId: input.paymentId,
            signature: input.signature,
        });

        if (verifyResult.isFailure) return Result.fail(verifyResult.getError());

        const creditResult = await this._creditWalletUsecase.execute({
            userId: input.userId,
            amount: verifyResult.getValue().amount,
        });

        return creditResult;
    }
}

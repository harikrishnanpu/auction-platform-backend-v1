import {
    IAuctionPaymentAmountSplitStrategy,
    IAuctionWinningAmountSplit,
} from '@application/interfaces/strategies/payments/IAuctionPaymentAmountStrategy';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class AuctionPaymentAmountSplitStrategy implements IAuctionPaymentAmountSplitStrategy {
    constructor(
        @inject(TYPES.ISystemConfigService)
        private readonly _systemConfigService: ISystemConfigService,
    ) {}

    async splitWinningAmount(
        winAmount: number,
    ): Promise<Result<IAuctionWinningAmountSplit>> {
        const ratioResult =
            await this._systemConfigService.getAuctionWinnerDepositSplitRatio();
        if (ratioResult.isFailure) {
            return Result.fail(ratioResult.getError());
        }
        const depositPercentage = ratioResult.getValue();
        const deposit = Math.floor(winAmount * depositPercentage);
        const balance = winAmount - deposit;
        return Result.ok({ deposit, balance });
    }
}

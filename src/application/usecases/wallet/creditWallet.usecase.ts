import { ICreditWalletInputDto } from '@application/dtos/wallet/creditWallet.dto';
import { IWalletOutputDto } from '@application/dtos/wallet/wallet.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ICreditWalletUsecase } from '@application/interfaces/usecases/wallet/ICreditWalletUsecase';
import { TYPES } from '@di/types.di';
import {
    WalletTransaction,
    WalletTransactionType,
} from '@domain/entities/wallet/wallet.transactions.entity';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { IWalletTransactionsRepository } from '@domain/repositories/IWallettransactionsRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class CreditWalletUsecase implements ICreditWalletUsecase {
    constructor(
        @inject(TYPES.IWalletRepository)
        private readonly _walletRepository: IWalletRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IWalletTransactionsRepository)
        private readonly _walletTransactionsRepository: IWalletTransactionsRepository,
    ) {}

    async execute(
        input: ICreditWalletInputDto,
    ): Promise<Result<IWalletOutputDto>> {
        const walletResult = await this._walletRepository.findByUserId(
            input.userId,
        );
        if (walletResult.isFailure) return Result.fail(walletResult.getError());

        const wallet = walletResult.getValue();

        if (!wallet) return Result.fail('Wallet not found');

        const walletTransaction = WalletTransaction.create({
            id: this._idGeneratingService.generateId(),
            walletId: wallet.getId(),
            amount: input.amount,
            type: WalletTransactionType.DEPOSIT,
        });

        if (walletTransaction.isFailure)
            return Result.fail(walletTransaction.getError());

        await this._walletTransactionsRepository.create(
            walletTransaction.getValue(),
        );

        const updateWallet = wallet.addToMainBalance(input.amount);
        if (updateWallet.isFailure) return Result.fail(updateWallet.getError());

        const updatedWallet = await this._walletRepository.save(wallet);
        if (updatedWallet.isFailure)
            return Result.fail(updatedWallet.getError());

        return Result.ok({
            id: updatedWallet.getValue().getId(),
            userId: wallet.getUserId(),
            mainBalance: updatedWallet.getValue().getMainBalance(),
            heldBalance: updatedWallet.getValue().getHeldBalance(),
            currency: updatedWallet.getValue().getCurrency(),
        });
    }
}

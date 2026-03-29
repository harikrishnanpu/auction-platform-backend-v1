import { IDebitWalletInputDto } from '@application/dtos/wallet/debitWallet.dto';
import { IWalletOutputDto } from '@application/dtos/wallet/wallet.dto';
import { IDebitWalletUsecase } from '@application/interfaces/usecases/wallet/IDebitWalletUsecase';
import { TYPES } from '@di/types.di';
import {
    WalletTransaction,
    WalletTransactionType,
} from '@domain/entities/wallet/wallet.transactions.entity';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { IWalletTransactionsRepository } from '@domain/repositories/IWallettransactionsRepo';
import { Result } from '@domain/shared/result';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { inject, injectable } from 'inversify';

@injectable()
export class DebitWalletUsecase implements IDebitWalletUsecase {
    constructor(
        @inject(TYPES.IWalletRepository)
        private readonly _walletRepository: IWalletRepository,
        @inject(TYPES.IWalletTransactionsRepository)
        private readonly _walletTransactionsRepository: IWalletTransactionsRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute(
        input: IDebitWalletInputDto,
    ): Promise<Result<IWalletOutputDto>> {
        const walletResult = await this._walletRepository.findByUserId(
            input.userId,
        );
        if (walletResult.isFailure) return Result.fail(walletResult.getError());

        const wallet = walletResult.getValue();
        if (!wallet) return Result.fail('Wallet not found');

        if (input.amount <= 0)
            return Result.fail('Amount must be greater than 0');

        if (wallet.getMainBalance() < input.amount) {
            return Result.fail('Insufficient wallet balance');
        }

        const transactionResult = WalletTransaction.create({
            id: this._idGeneratingService.generateId(),
            walletId: wallet.getId(),
            amount: input.amount,
            type: WalletTransactionType.WITHDRAWAL,
        });

        if (transactionResult.isFailure) {
            return Result.fail(transactionResult.getError());
        }

        await this._walletTransactionsRepository.create(
            transactionResult.getValue(),
        );

        const debitResult = wallet.debitFromMainBalance(input.amount);
        if (debitResult.isFailure) return Result.fail(debitResult.getError());

        const updatedWallet = await this._walletRepository.save(wallet);
        if (updatedWallet.isFailure)
            return Result.fail(updatedWallet.getError());

        return Result.ok({
            id: updatedWallet.getValue().getId(),
            userId: updatedWallet.getValue().getUserId(),
            mainBalance: updatedWallet.getValue().getMainBalance(),
            heldBalance: updatedWallet.getValue().getHeldBalance(),
            currency: updatedWallet.getValue().getCurrency(),
        });
    }
}

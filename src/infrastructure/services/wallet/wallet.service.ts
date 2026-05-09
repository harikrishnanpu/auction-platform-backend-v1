import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IWalletService } from '@application/interfaces/services/IWalletService';
import { TYPES } from '@di/types.di';
import {
    WalletTransaction,
    WalletTransactionType,
} from '@domain/entities/wallet/wallet.transactions.entity';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { IWalletTransactionsRepository } from '@domain/repositories/IWallettransactionsRepo';
import { Result } from '@domain/shared/result';
import { inject } from 'inversify';

export class WalletService implements IWalletService {
    constructor(
        @inject(TYPES.IWalletRepository)
        private readonly _walletRepository: IWalletRepository,
        @inject(TYPES.IWalletTransactionsRepository)
        private readonly _walletTransactionsRepository: IWalletTransactionsRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async creditWallet(userId: string, amount: number): Promise<Result<void>> {
        const walletResult = await this._walletRepository.findByUserId(userId);
        if (walletResult.isFailure) return Result.fail(walletResult.getError());

        const wallet = walletResult.getValue();
        if (!wallet) return Result.fail('Wallet not found');

        const walletTransaction = WalletTransaction.create({
            id: this._idGeneratingService.generateId(),
            walletId: wallet.getId(),
            amount: amount,
            type: WalletTransactionType.DEPOSIT,
        });

        if (walletTransaction.isFailure)
            return Result.fail(walletTransaction.getError());

        await this._walletTransactionsRepository.create(
            walletTransaction.getValue(),
        );

        const creditResult = wallet.addToMainBalance(amount);
        if (creditResult.isFailure) return Result.fail(creditResult.getError());

        await this._walletRepository.save(wallet);

        return Result.ok(undefined);
    }

    async debitWallet(userId: string, amount: number): Promise<Result<void>> {
        const walletResult = await this._walletRepository.findByUserId(userId);
        if (walletResult.isFailure) return Result.fail(walletResult.getError());

        const wallet = walletResult.getValue();
        if (!wallet) return Result.fail('Wallet not found');

        const walletTransaction = WalletTransaction.create({
            id: this._idGeneratingService.generateId(),
            walletId: wallet.getId(),
            amount: amount,
            type: WalletTransactionType.WITHDRAWAL,
        });

        if (walletTransaction.isFailure)
            return Result.fail(walletTransaction.getError());

        await this._walletTransactionsRepository.create(
            walletTransaction.getValue(),
        );

        const debitResult = wallet.debitFromMainBalance(amount);
        if (debitResult.isFailure) return Result.fail(debitResult.getError());

        await this._walletRepository.save(wallet);

        return Result.ok(undefined);
    }
}

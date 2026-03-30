import { TYPES } from '@di/types.di';
import { WalletTransaction } from '@domain/entities/wallet/wallet.transactions.entity';
import { IWalletTransactionsRepository } from '@domain/repositories/IWallettransactionsRepo';
import { Result } from '@domain/shared/result';
import { WalletTransactionMapper } from '@infrastructure/mappers/wallet/wallet.transactions.mapper';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

injectable();
export class PrismaWalletTransactionsRepository implements IWalletTransactionsRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
    ) {}

    async create(
        walletTransaction: WalletTransaction,
    ): Promise<Result<WalletTransaction>> {
        const result = await this._prisma.walletTransaction.create({
            data: {
                id: walletTransaction.getId(),
                walletId: walletTransaction.getWalletId(),
                amount: walletTransaction.getAmount(),
                type: walletTransaction.getType(),
            },
        });

        return WalletTransactionMapper.toDomain(result);
    }
}

import { TYPES } from '@di/types.di';
import { WalletTransaction } from '@domain/entities/wallet/wallet.transactions.entity';
import { IWalletTransactionsRepository } from '@domain/repositories/IWallettransactionsRepo';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { WalletTransaction as PrismaWalletTransaction } from '@prisma/client';
import { IDbMapper } from '@domain/mappers/IDbMapper';

injectable();
export class PrismaWalletTransactionsRepository
    extends BaseRepository<
        WalletTransaction,
        PrismaWalletTransaction,
        { id: string },
        IDbMapper<WalletTransaction, PrismaWalletTransaction>
    >
    implements IWalletTransactionsRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.WalletTransactionMapper)
        readonly mapper: IDbMapper<WalletTransaction, PrismaWalletTransaction>,
    ) {
        super(_prisma.walletTransaction, mapper);
    }
}

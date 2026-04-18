import {
    WalletTransaction,
    WalletTransactionType,
} from '@domain/entities/wallet/wallet.transactions.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { WalletTransaction as PrismaWalletTransaction } from '@prisma/client';

export class WalletTransactionMapper implements IDbMapper<
    WalletTransaction,
    PrismaWalletTransaction
> {
    toDomain(raw: PrismaWalletTransaction): Result<WalletTransaction> {
        return WalletTransaction.create({
            id: raw.id,
            walletId: raw.walletId,
            amount: raw.amount,
            type: raw.type as WalletTransactionType,
            createdAt: raw.createdAt,
        });
    }

    toPersistence(walletTransaction: WalletTransaction): unknown {
        return {
            id: walletTransaction.getId(),
            walletId: walletTransaction.getWalletId(),
            amount: walletTransaction.getAmount(),
            type: walletTransaction.getType(),
            createdAt: walletTransaction.getCreatedAt(),
        };
    }
}

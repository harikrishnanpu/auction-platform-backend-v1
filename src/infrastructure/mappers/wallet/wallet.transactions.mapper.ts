import {
    WalletTransaction,
    WalletTransactionType,
} from '@domain/entities/wallet/wallet.transactions.entity';
import { Result } from '@domain/shared/result';
import { WalletTransaction as PrismaWalletTransaction } from '@prisma/client';

export class WalletTransactionMapper {
    static toDomain(raw: PrismaWalletTransaction): Result<WalletTransaction> {
        return WalletTransaction.create({
            id: raw.id,
            walletId: raw.walletId,
            amount: raw.amount,
            type: raw.type as WalletTransactionType,
            createdAt: raw.createdAt,
        });
    }
}

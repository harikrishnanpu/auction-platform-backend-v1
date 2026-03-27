import { WalletTransaction } from '@domain/entities/wallet/wallet.transactions.entity';
import { Result } from '@domain/shared/result';

export interface IWalletTransactionsRepository {
    create(
        walletTransaction: WalletTransaction,
    ): Promise<Result<WalletTransaction>>;
}

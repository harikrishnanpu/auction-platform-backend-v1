import { Wallet } from '@domain/entities/wallet/wallet.entity';
import { Result } from '@domain/shared/result';

export interface IWalletRepository {
    findByUserId(userId: string): Promise<Result<Wallet | null>>;
    save(wallet: Wallet): Promise<Result<Wallet>>;
}

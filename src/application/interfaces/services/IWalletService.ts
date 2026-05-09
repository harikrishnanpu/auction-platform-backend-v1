import { Result } from '@domain/shared/result';

export interface IWalletService {
    creditWallet(userId: string, amount: number): Promise<Result<void>>;
    debitWallet(userId: string, amount: number): Promise<Result<void>>;
}

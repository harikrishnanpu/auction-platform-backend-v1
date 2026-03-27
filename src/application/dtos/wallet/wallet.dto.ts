import { WalletCurrency } from '@domain/entities/wallet/wallet.entity';

export interface IGetOrCreateWalletInputDto {
    userId: string;
}

export interface IWalletOutputDto {
    id: string;
    userId: string;
    mainBalance: number;
    heldBalance: number;
    currency: WalletCurrency;
}

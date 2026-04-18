import { Wallet, WalletCurrency } from '@domain/entities/wallet/wallet.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { Wallet as PrismaWallet } from '@prisma/client';

export class WalletMapper implements IDbMapper<Wallet, PrismaWallet> {
    toDomain(raw: PrismaWallet): Result<Wallet> {
        return Wallet.create({
            id: raw.id,
            userId: raw.userId,
            mainBalance: raw.mainBalance,
            heldBalance: raw.heldBalance,
            currency: raw.currency as WalletCurrency,
        });
    }

    toPersistence(wallet: Wallet): unknown {
        return {
            id: wallet.getId(),
            userId: wallet.getUserId(),
            mainBalance: wallet.getMainBalance(),
            heldBalance: wallet.getHeldBalance(),
            currency: wallet.getCurrency(),
        };
    }
}

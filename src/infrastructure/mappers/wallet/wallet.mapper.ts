import { Wallet, WalletCurrency } from '@domain/entities/wallet/wallet.entity';
import { Result } from '@domain/shared/result';
import { Wallet as PrismaWallet } from '@prisma/client';

export class WalletMapper {
    static toDomain(raw: PrismaWallet): Result<Wallet> {
        return Wallet.create({
            id: raw.id,
            userId: raw.userId,
            mainBalance: raw.mainBalance,
            heldBalance: raw.heldBalance,
            currency: raw.currency as WalletCurrency,
        });
    }
}

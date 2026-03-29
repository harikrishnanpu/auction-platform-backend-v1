import { TYPES } from '@di/types.di';
import { Wallet } from '@domain/entities/wallet/wallet.entity';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { Result } from '@domain/shared/result';
import { WalletMapper } from '@infrastructure/mappers/wallet/wallet.mapper';
import { PrismaBaseRepository } from '@infrastructure/repositories/base';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaWalletRepository
    extends PrismaBaseRepository
    implements IWalletRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        prisma: PrismaClient,
    ) {
        super(prisma);
    }

    async save(wallet: Wallet): Promise<Result<Wallet>> {
        const result = await this.prisma.wallet.upsert({
            where: { id: wallet.getId() },
            update: {
                mainBalance: wallet.getMainBalance(),
                heldBalance: wallet.getHeldBalance(),
            },
            create: {
                id: wallet.getId(),
                userId: wallet.getUserId(),
                mainBalance: wallet.getMainBalance(),
                heldBalance: wallet.getHeldBalance(),
                currency: wallet.getCurrency(),
            },
        });

        return WalletMapper.toDomain(result);
    }

    async findByUserId(userId: string): Promise<Result<Wallet | null>> {
        const result = await this.prisma.wallet.findUnique({
            where: { userId },
        });

        if (!result) return Result.ok(null);
        return WalletMapper.toDomain(result);
    }
}

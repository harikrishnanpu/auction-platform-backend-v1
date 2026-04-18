import { TYPES } from '@di/types.di';
import { Wallet } from '@domain/entities/wallet/wallet.entity';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { Result } from '@domain/shared/result';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Wallet as PrismaWallet } from '@prisma/client';

@injectable()
export class PrismaWalletRepository
    extends BaseRepository<
        Wallet,
        PrismaWallet,
        { id: string },
        IDbMapper<Wallet, PrismaWallet>
    >
    implements IWalletRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.WalletMapper)
        readonly mapper: IDbMapper<Wallet, PrismaWallet>,
    ) {
        super(_prisma.wallet, mapper);
    }

    async findByUserId(userId: string): Promise<Result<Wallet | null>> {
        const result = await this._prisma.wallet.findUnique({
            where: { userId },
        });

        if (!result) return Result.ok(null);
        return this.mapper.toDomain(result);
    }
}

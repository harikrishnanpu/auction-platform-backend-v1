import { TYPES } from '@di/types.di';
import { AutoBidConfig } from '@domain/entities/auction/auto-bid-config.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { IAutoBidConfigRepository } from '@domain/repositories/IAutoBidConfigRepository';
import { Result } from '@domain/shared/result';
import {
    AutoBidConfig as PrismaAutoBidConfig,
    PrismaClient,
} from '@prisma/client';
import { inject, injectable } from 'inversify';
import { BaseRepository } from '../base/base.Repo';

@injectable()
export class PrismaAutoBidConfigRepository
    extends BaseRepository<
        AutoBidConfig,
        PrismaAutoBidConfig,
        { userId?: string; auctionId?: string; isActive?: boolean },
        IDbMapper<AutoBidConfig, PrismaAutoBidConfig>
    >
    implements IAutoBidConfigRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.AutoBidConfigMapper)
        private readonly _mapper: IDbMapper<AutoBidConfig, PrismaAutoBidConfig>,
    ) {
        super(_prisma.autoBidConfig, _mapper);
    }

    async disableAllActiveByAuctionId(
        auctionId: string,
    ): Promise<Result<void>> {
        await this._prisma.autoBidConfig.updateMany({
            where: { auctionId, isActive: true },
            data: { isActive: false },
        });
        return Result.ok();
    }

    async findByUserAndAuction(
        userId: string,
        auctionId: string,
    ): Promise<Result<AutoBidConfig | null>> {
        const raw = await this._prisma.autoBidConfig.findUnique({
            where: { userId_auctionId: { userId, auctionId } },
        });
        if (!raw) return Result.ok(null);
        return this._mapper.toDomain(raw);
    }

    async findActiveByAuctionId(
        auctionId: string,
    ): Promise<Result<AutoBidConfig[]>> {
        const rows = await this._prisma.autoBidConfig.findMany({
            where: { auctionId, isActive: true },
            orderBy: [{ maxBidAmount: 'desc' }, { createdAt: 'asc' }],
        });

        const result: AutoBidConfig[] = [];
        for (const raw of rows) {
            const mapped = this._mapper.toDomain(raw);
            if (mapped.isFailure) return Result.fail(mapped.getError());
            result.push(mapped.getValue());
        }
        return Result.ok(result);
    }
}

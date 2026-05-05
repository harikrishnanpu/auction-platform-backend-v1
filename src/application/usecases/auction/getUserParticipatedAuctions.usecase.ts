import type { IGetUserParticipatedAuctionsOutputDto } from '@application/dtos/auction/get-user-participated-auctions.dto';
import type { IGetUserParticipatedAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetUserParticipatedAuctionsUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import {
    Auction,
    AuctionStatus,
} from '@domain/entities/auction/auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { ZodGetUserParticipatedAuctionsInputType } from '@presentation/validators/schemas/auction/getUserParticipatedAuctionsInput.schema';
import { inject, injectable } from 'inversify';

function participationLabel(
    auction: Auction,
    userId: string,
    leadUserId: string | null,
): { outcome: string; label: string } {
    const winnerId = auction.getWinnerId();
    if (winnerId === userId) {
        return { outcome: 'WON', label: 'Won' };
    }
    if (winnerId && winnerId !== userId) {
        return { outcome: 'LOST', label: 'Lost' };
    }

    const status = auction.getStatus();
    if (status === AuctionStatus.CANCELLED) {
        return { outcome: 'CANCELLED', label: 'Cancelled' };
    }
    if (status === AuctionStatus.PAUSED) {
        return { outcome: 'PAUSED', label: 'Paused' };
    }

    const now = Date.now();
    const start = auction.getStartAt().getTime();
    const end = auction.getEndAt().getTime();
    const scheduleOk = Number.isFinite(start) && Number.isFinite(end);

    if (
        status === AuctionStatus.ACTIVE &&
        scheduleOk &&
        now >= start &&
        now < end
    ) {
        if (!leadUserId) {
            return { outcome: 'NO_BIDS', label: 'No bids yet' };
        }
        if (leadUserId === userId) {
            return { outcome: 'WINNING', label: 'Winning' };
        }
        return { outcome: 'OUTBID', label: 'Outbid' };
    }

    if (status === AuctionStatus.ACTIVE && scheduleOk && now < start) {
        return { outcome: 'UPCOMING', label: 'Upcoming' };
    }

    return { outcome: 'ENDED', label: 'Ended' };
}

@injectable()
export class GetUserParticipatedAuctionsUsecase implements IGetUserParticipatedAuctionsUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: ZodGetUserParticipatedAuctionsInputType,
    ): Promise<Result<IGetUserParticipatedAuctionsOutputDto>> {
        const {
            userId,
            query: { page, limit, search, auctionType, status, sort, order },
        } = AuctionMapperProrfile.toGetUserParticipatedAuctionsInputDto(input);

        const safePage = Number(page) > 0 ? Number(page) : 1;
        const safeLimit = Number(limit) > 0 ? Number(limit) : 10;

        const auctionsRes =
            await this._auctionRepository.findParticipatedByUserId(userId, {
                status: status,
                auctionType: auctionType,
                page: safePage,
                limit: safeLimit,
                sort: sort,
                order: order,
                search: search,
            });

        if (auctionsRes.isFailure) return Result.fail(auctionsRes.getError());

        const {
            auctions: filteredAuctions,
            total,
            leadBidderUserIdByAuctionId,
        } = auctionsRes.getValue();

        const totalPages = Math.max(1, Math.ceil(total / safeLimit));
        const currentPage = Math.min(safePage, totalPages);

        const auctions = filteredAuctions.map((a) => {
            const dto = AuctionMapperProrfile.toAuctionOutputDto(a);
            const lead = leadBidderUserIdByAuctionId.get(a.getId()) ?? null;
            const { outcome, label } = participationLabel(a, userId, lead);
            return {
                ...dto,
                participation: { outcome, label },
            };
        });

        return Result.ok({
            auctions,
            total,
            page: currentPage,
            limit: safeLimit,
            totalPages,
            currentPage,
        });
    }
}

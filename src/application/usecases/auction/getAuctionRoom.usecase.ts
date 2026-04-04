import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { IFallbackAuctionParticipantsRepo } from '@domain/repositories/IFallbackAuctionParticipantsRepo';
import { IAuctionWinnerRepository } from '@domain/repositories/IAuctionWinnerRepo';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { TYPES } from '@di/types.di';
import { inject, injectable } from 'inversify';
import { Result } from '@domain/shared/result';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import { PublicAuctionFallbackParticipantsStatus } from '@domain/entities/auction/public-auction-fallback-participants.entity';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { IGetAuctionRoomUsecase } from '@application/interfaces/usecases/auction/IGetAuctionRoomUsecase';
import {
    IAuctionRoomBidDto,
    IAuctionRoomParticipantDto,
    IAuctionRoomResultDto,
    IGetAuctionRoomInputDto,
} from '@application/dtos/auction/getAuctionRoom.dto';

@injectable()
export class GetAuctionRoomUsecase implements IGetAuctionRoomUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IBidRepository)
        private readonly _bidRepository: IBidRepository,
        @inject(TYPES.IAuctionParticipantRepository)
        private readonly _participantRepository: IAuctionParticipantRepository,
        @inject(TYPES.IFallbackAuctionParticipantsRepo)
        private readonly _fallbackParticipantsRepo: IFallbackAuctionParticipantsRepo,
        @inject(TYPES.IAuctionWinnerRepository)
        private readonly _auctionWinnerRepository: IAuctionWinnerRepository,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
    ) {}

    async execute(
        input: IGetAuctionRoomInputDto,
    ): Promise<Result<IAuctionRoomResultDto>> {
        const auctionResult = await this._auctionRepository.findById(
            input.auctionId,
        );

        if (auctionResult.isFailure) {
            return Result.fail(auctionResult.getError());
        }

        const auction = auctionResult.getValue();

        if (auction.getStatus() === AuctionStatus.DRAFT) {
            return Result.fail('Only non-draft auctions can be viewed');
        }

        const auctionDto = AuctionMapperProrfile.toAuctionOutputDto(auction);

        const latestBidResult = await this._bidRepository.findLatestByAuctionId(
            input.auctionId,
        );

        if (latestBidResult.isFailure)
            return Result.fail(latestBidResult.getError());

        const latestBid = latestBidResult.getValue();

        const currentBid: IAuctionRoomBidDto | null = latestBid
            ? {
                  id: latestBid.getId(),
                  auctionId: latestBid.getAuctionId(),
                  userId: latestBid.getUserId(),
                  amount: latestBid.getAmount(),
                  createdAt: latestBid.getCreatedAt().toISOString(),
              }
            : null;

        const bidsLimit = 1000; // ----!!!!!----------

        const liveFeedResult = await this._bidRepository.findManyByAuctionId(
            input.auctionId,
            bidsLimit,
        );

        if (liveFeedResult.isFailure)
            return Result.fail(liveFeedResult.getError());

        const liveFeed = liveFeedResult.getValue().map((b) => ({
            id: b.getId(),
            auctionId: b.getAuctionId(),
            userId: b.getUserId(),
            amount: b.getAmount(),
            createdAt: b.getCreatedAt().toISOString(),
        }));

        const participantsResult =
            await this._participantRepository.findByAuctionId(input.auctionId);

        if (participantsResult.isFailure) {
            return Result.fail(participantsResult.getError());
        }

        const participants: IAuctionRoomParticipantDto[] = participantsResult
            .getValue()
            .map((p) => ({
                id: p.getId(),
                auctionId: p.getAuctionId(),
                userId: p.getUserId(),
                userName: p.getUserName(),
                joinedAt: p.getJoinedAt().toISOString(),
            }));

        const result: IAuctionRoomResultDto = {
            auction: auctionDto,
            currentBid,
            liveFeed,
            participants,
        };

        const status = auction.getStatus();
        const mode = input.mode;

        if (
            status === AuctionStatus.FALLBACK_PUBLIC_NOTIFICATION &&
            (mode === 'SELLER' || mode === 'ADMIN')
        ) {
            const statsRes = await this.buildFallbackPublicStats(
                input.auctionId,
            );
            if (statsRes) {
                result.fallbackPublicParticipantStats = statsRes;
            }
        }

        if (status === AuctionStatus.SOLD) {
            const winAmount = auction.getWinAmount() ?? 0;
            const winnerId = auction.getWinnerId() ?? undefined;
            if (!winnerId) return Result.fail('Winner not found');
            const soldRes = await this.buildSoldSummary(winnerId, winAmount);
            if (soldRes) {
                result.soldSummary = soldRes;
            }
        }

        return Result.ok(result);
    }

    private async buildFallbackPublicStats(auctionId: string) {
        const listResult =
            await this._fallbackParticipantsRepo.findByAuctionId(auctionId);
        if (listResult.isFailure) return undefined;

        let pending = 0;
        let rejected = 0;

        for (const participant of listResult.getValue()) {
            const status = participant.getStatus();
            if (status === PublicAuctionFallbackParticipantsStatus.PENDING) {
                pending += 1;
            } else if (
                status === PublicAuctionFallbackParticipantsStatus.REJECTED
            ) {
                rejected += 1;
            }
        }

        return { pending, rejected };
    }

    private async buildSoldSummary(winnedId: string, winAmount: number) {
        const userResult = await this._userRepository.findById(winnedId);
        if (userResult.isFailure) return undefined;
        const user = userResult.getValue();

        return {
            winnerUserName: user.getName(),
            winnerUserId: user.getId(),
            soldAmount: winAmount,
        };
    }
}

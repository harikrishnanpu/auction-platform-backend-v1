import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { TYPES } from '@di/types.di';
import { inject, injectable } from 'inversify';
import { Result } from '@domain/shared/result';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
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

        return Result.ok(result);
    }
}

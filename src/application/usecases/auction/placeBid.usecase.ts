import {
    IPlaceBidInput,
    IPlaceBidOutput,
} from '@application/dtos/auction/place-bid.dto';
import { IPlaceBidUsecase } from '@application/interfaces/usecases/auction/IPlaceBidUsecase';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { IBidLockService } from '@application/interfaces/services/IBidLockService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { Auction } from '@domain/entities/auction/auction.entity';
import { PlaceBidStartegyFactory } from '@application/factories/placeBidStartegy.factory';
import { BID_LOCK_TTL_SECONDS } from '@application/constants/auction/bid.constants';
import { PlaceBidPolicyService } from '@domain/policies/auction/place-bid-policy.service';
import { AuctionParticipantPaymentStatus } from '@domain/entities/auction/auction-participant.entity';
import { ShouldExtendAuctionPolicy } from '@domain/policies/auction/should-extend-auction.policy';

@injectable()
export class PlaceBidUsecase implements IPlaceBidUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepo: IAuctionRepository,
        @inject(TYPES.IBidRepository)
        private readonly _bidRepo: IBidRepository,
        @inject(TYPES.IAuctionParticipantRepository)
        private readonly _participantRepo: IAuctionParticipantRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IBidLockService)
        private readonly _bidLockService: IBidLockService,
        @inject(TYPES.PlaceBidPolicyService)
        private readonly _placeBidPolicyService: PlaceBidPolicyService,
        @inject(TYPES.PlaceBidStartegyFactory)
        private readonly _placeBidStartegyFactory: PlaceBidStartegyFactory,
    ) {}

    async execute(input: IPlaceBidInput): Promise<Result<IPlaceBidOutput>> {
        // console.log("BID INPUT: ", input);

        const lockKey = this._bidLockService.lockKeyForAuction(input.auctionId);
        const lockToken = this._idGeneratingService.generateId();

        try {
            console.log('lockKey', lockKey);

            const locked = await this._bidLockService.lock(
                lockKey,
                lockToken,
                BID_LOCK_TTL_SECONDS,
            );

            if (!locked) {
                return Result.fail('Bid is being processed, try again');
            }

            const auctionResult = await this._auctionRepo.findById(
                input.auctionId,
            );

            if (auctionResult.isFailure) {
                return Result.fail(auctionResult.getError());
            }

            const latestBidResult = await this._bidRepo.findLatestByAuctionId(
                input.auctionId,
            );

            if (latestBidResult.isFailure) {
                return Result.fail(latestBidResult.getError());
            }

            const lastUserBidResult = await this._bidRepo.findLastBidsByUser(
                input.auctionId,
                input.userId,
            );

            if (lastUserBidResult.isFailure) {
                return Result.fail(lastUserBidResult.getError());
            }

            const participantsResult =
                await this._participantRepo.findByAuctionId(input.auctionId);
            if (participantsResult.isFailure) {
                return Result.fail(participantsResult.getError());
            }

            console.log('participantsResult', participantsResult.getValue());

            const participant = participantsResult
                .getValue()
                .find((p) => p.getUserId() === input.userId);
            if (
                !participant ||
                participant.getIntialAmount() !==
                    AuctionParticipantPaymentStatus.PAID
            ) {
                return Result.fail(
                    'Participant not found or not paid inital amount',
                );
            }

            const placeBidStrategy = this._placeBidStartegyFactory.getStrategy(
                auctionResult.getValue().getAuctionType(),
            );

            const newBidEntity = placeBidStrategy.validateAndCreateBid({
                auction: auctionResult.getValue(),
                userId: input.userId,
                amount: input.amount,
                latestBid: latestBidResult.getValue(),
                userLatestBid: lastUserBidResult.getValue(),
            });

            if (newBidEntity.isFailure) {
                return Result.fail(newBidEntity.getError());
            }

            const newBid = newBidEntity.getValue();

            const shouldExtend = ShouldExtendAuctionPolicy.shouldExtendAuction(
                auctionResult.getValue(),
                auctionResult.getValue().getEndAt().getTime() - Date.now(),
            );

            if (shouldExtend) {
                const updatedAuctionRes = Auction.create({
                    id: auctionResult.getValue().getId(),
                    sellerId: auctionResult.getValue().getSellerId(),
                    auctionType: auctionResult.getValue().getAuctionType(),
                    title: auctionResult.getValue().getTitle(),
                    description: auctionResult.getValue().getDescription(),
                    category: auctionResult.getValue().getCategory(),
                    condition: auctionResult.getValue().getCondition(),
                    startPrice: auctionResult.getValue().getStartPrice(),
                    minIncrement: auctionResult.getValue().getMinIncrement(),
                    startAt: auctionResult.getValue().getStartAt(),
                    endAt: new Date(
                        auctionResult.getValue().getEndAt().getTime() +
                            auctionResult.getValue().getAntiSnipSeconds() *
                                1000,
                    ),
                    antiSnipSeconds: auctionResult
                        .getValue()
                        .getAntiSnipSeconds(),
                    extensionCount: auctionResult
                        .getValue()
                        .getExtensionCount(),
                    maxExtensionCount: auctionResult
                        .getValue()
                        .getMaxExtensionCount(),
                    bidCooldownSeconds: auctionResult
                        .getValue()
                        .getBidCooldownSeconds(),
                    status: auctionResult.getValue().getStatus(),
                    winnerId: auctionResult.getValue().getWinnerId(),
                    assets: auctionResult.getValue().getAssets(),
                });

                if (updatedAuctionRes.isFailure) {
                    return Result.fail(updatedAuctionRes.getError());
                }

                const updatedAuction = updatedAuctionRes.getValue();
                const saveRes = await this._auctionRepo.save(updatedAuction);
                if (saveRes.isFailure) {
                    return Result.fail(saveRes.getError());
                }
            }

            const createBidResult = await this._bidRepo.create(newBid);

            if (createBidResult.isFailure) {
                return Result.fail(createBidResult.getError());
            }

            const output: IPlaceBidOutput = {
                id: createBidResult.getValue().getId(),
                auctionId: createBidResult.getValue().getAuctionId(),
                userId: createBidResult.getValue().getUserId(),
                amount: createBidResult.getValue().getAmount(),
                createdAt: createBidResult
                    .getValue()
                    .getCreatedAt()
                    .toISOString(),
                endAt: auctionResult.getValue().getEndAt().toISOString(),
                extensionCount: auctionResult.getValue().getExtensionCount(),
                participants: participantsResult.getValue().map((p) => ({
                    id: p.getId(),
                    auctionId: p.getAuctionId(),
                    userId: p.getUserId(),
                    userName: p.getUserName(),
                    joinedAt: p.getJoinedAt().toISOString(),
                })),
            };

            return Result.ok(output);
        } catch (error) {
            console.log('error', error);
            // return;
            return Result.fail('An unexpected error occurred');
        } finally {
            await this._bidLockService.release(lockKey, lockToken);
        }
    }
}

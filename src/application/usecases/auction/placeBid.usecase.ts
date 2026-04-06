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

            const auctionEntity = auctionResult.getValue();
            const remainingMs = auctionEntity.getEndAt().getTime() - Date.now();

            const shouldExtend = ShouldExtendAuctionPolicy.shouldExtendAuction(
                auctionEntity,
                remainingMs,
            );

            let auctionForOutput = auctionEntity;

            if (shouldExtend) {
                const nextExtensionCount =
                    auctionEntity.getExtensionCount() + 1;
                const updatedAuctionRes = Auction.create({
                    id: auctionEntity.getId(),
                    sellerId: auctionEntity.getSellerId(),
                    auctionType: auctionEntity.getAuctionType(),
                    title: auctionEntity.getTitle(),
                    description: auctionEntity.getDescription(),
                    category: auctionEntity.getCategory(),
                    condition: auctionEntity.getCondition(),
                    startPrice: auctionEntity.getStartPrice(),
                    minIncrement: auctionEntity.getMinIncrement(),
                    startAt: auctionEntity.getStartAt(),
                    endAt: new Date(
                        auctionEntity.getEndAt().getTime() +
                            auctionEntity.getAntiSnipSeconds() * 1000,
                    ),
                    antiSnipSeconds: auctionEntity.getAntiSnipSeconds(),
                    extensionCount: nextExtensionCount,
                    maxExtensionCount: auctionEntity.getMaxExtensionCount(),
                    bidCooldownSeconds: auctionEntity.getBidCooldownSeconds(),
                    status: auctionEntity.getStatus(),
                    winnerId: auctionEntity.getWinnerId(),
                    winAmount: auctionEntity.getWinAmount(),
                    assets: auctionEntity.getAssets(),
                });

                if (updatedAuctionRes.isFailure) {
                    return Result.fail(updatedAuctionRes.getError());
                }

                const saveRes = await this._auctionRepo.save(
                    updatedAuctionRes.getValue(),
                );
                if (saveRes.isFailure) {
                    return Result.fail(saveRes.getError());
                }

                auctionForOutput = saveRes.getValue();
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
                endAt: auctionForOutput.getEndAt().toISOString(),
                extensionCount: auctionForOutput.getExtensionCount(),
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

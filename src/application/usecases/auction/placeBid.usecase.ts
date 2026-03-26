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
import { PlaceBidStartegyFactory } from '@application/strategies/factory/placeBidStartegy.factory';
import { BID_LOCK_TTL_SECONDS } from '@application/constants/auction/bid.constants';
import { Bid } from '@domain/entities/auction/bid.entity';
import { PlaceBidPolicyService } from '@domain/policies/place-bid-policy.service';
import { AuctionParticipant } from '@domain/entities/auction/auction-participant.entity';

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

            const auction = auctionResult.getValue();

            if (auction.getStartPrice() > input.amount) {
                return Result.fail(
                    `Bid must be at least ${auction.getStartPrice()}`,
                );
            }

            const latestBidResult = await this._bidRepo.findLatestByAuctionId(
                input.auctionId,
            );
            if (latestBidResult.isFailure) {
                return Result.fail(latestBidResult.getError());
            }

            const strategy = PlaceBidStartegyFactory.create(
                auction.getAuctionType(),
            );

            const validatedInputResult = strategy.validate(input);
            if (validatedInputResult.isFailure)
                return Result.fail(validatedInputResult.getError());
            const validatedBid = validatedInputResult.getValue();

            const strategyRulesResult = strategy.applyRules({
                input,
                auction,
                latestBid: latestBidResult.getValue(),
            });

            if (strategyRulesResult.isFailure) {
                return Result.fail(strategyRulesResult.getError());
            }

            const lastUserBidResult = await this._bidRepo.findLastBidsByUser(
                input.auctionId,
                input.userId,
            );

            if (lastUserBidResult.isFailure) {
                return Result.fail(lastUserBidResult.getError());
            }

            const newBid = Bid.create({
                id: this._idGeneratingService.generateId(),
                auctionId: input.auctionId,
                userId: input.userId,
                amount: validatedBid.amount ?? 0,
                encryptedAmount: validatedBid.encryptedAmount ?? '',
            });

            if (newBid.isFailure) {
                return Result.fail(newBid.getError());
            }

            const canPlaceBidResult = this._placeBidPolicyService.canPlaceBid(
                auction,
                input.userId,
                validatedBid.amount ?? 0,
                newBid.getValue(),
                lastUserBidResult.getValue(),
            );

            if (canPlaceBidResult.isFailure) {
                return Result.fail(canPlaceBidResult.getError());
            }

            const shouldExtend = PlaceBidStartegyFactory.shouldExtendAuction(
                auction,
                auction.getEndAt().getTime() - Date.now(),
            );

            if (shouldExtend) {
                const updatedAuctionRes = Auction.create({
                    id: auction.getId(),
                    sellerId: auction.getSellerId(),
                    auctionType: auction.getAuctionType(),
                    title: auction.getTitle(),
                    description: auction.getDescription(),
                    category: auction.getCategory(),
                    condition: auction.getCondition(),
                    startPrice: auction.getStartPrice(),
                    minIncrement: auction.getMinIncrement(),
                    startAt: auction.getStartAt(),
                    endAt: new Date(
                        auction.getEndAt().getTime() +
                            auction.getAntiSnipSeconds() * 1000,
                    ),
                    antiSnipSeconds: auction.getAntiSnipSeconds(),
                    extensionCount: auction.getExtensionCount(),
                    maxExtensionCount: auction.getMaxExtensionCount(),
                    bidCooldownSeconds: auction.getBidCooldownSeconds(),
                    status: auction.getStatus(),
                    winnerId: auction.getWinnerId(),
                    assets: auction.getAssets(),
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

            const createBidResult = await this._bidRepo.create(
                newBid.getValue(),
            );

            if (createBidResult.isFailure) {
                return Result.fail(createBidResult.getError());
            }

            const participant = AuctionParticipant.create({
                id: this._idGeneratingService.generateId(),
                auctionId: input.auctionId,
                userId: input.userId,
                userName: input.userName,
                joinedAt: new Date(),
            });

            if (participant.isFailure) {
                return Result.fail(participant.getError());
            }

            const participantResult = await this._participantRepo.save(
                participant.getValue(),
            );

            if (participantResult.isFailure) {
                return Result.fail(participantResult.getError());
            }

            const participantsResult =
                await this._participantRepo.findByAuctionId(input.auctionId);
            if (participantsResult.isFailure) {
                return Result.fail(participantsResult.getError());
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
                endAt: auction.getEndAt().toISOString(),
                extensionCount: auction.getExtensionCount(),
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

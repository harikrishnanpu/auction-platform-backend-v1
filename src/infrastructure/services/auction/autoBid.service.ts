import {
    IAutoBid,
    IAutoBidService,
} from '@application/interfaces/services/IAutoBidService';
import { PlaceBidStartegyFactory } from '@application/factories/placeBidStartegy.factory';
import { TYPES } from '@di/types.di';
import { AutoBidConfig } from '@domain/entities/auction/auto-bid-config.entity';
import { Auction, AuctionType } from '@domain/entities/auction/auction.entity';
import { AuctionParticipantPaymentStatus } from '@domain/entities/auction/auction-participant.entity';
import { ShouldExtendAuctionPolicy } from '@domain/policies/auction/should-extend-auction.policy';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { IAutoBidConfigRepository } from '@domain/repositories/IAutoBidConfigRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class AutoBidService implements IAutoBidService {
    constructor(
        @inject(TYPES.IAutoBidConfigRepository)
        private readonly _autoBidConfigRepository: IAutoBidConfigRepository,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepo: IAuctionRepository,
        @inject(TYPES.IBidRepository)
        private readonly _bidRepo: IBidRepository,
        @inject(TYPES.IAuctionParticipantRepository)
        private readonly _participantRepo: IAuctionParticipantRepository,
        @inject(TYPES.PlaceBidStartegyFactory)
        private readonly _placeBidStartegyFactory: PlaceBidStartegyFactory,
    ) {}

    private isBidInAntiSnippingTime(auction: Auction): boolean {
        const remainingMs = auction.getEndAt().getTime() - Date.now();
        const antiSnipWindowMs = auction.getAntiSnipSeconds() * 1000;
        return remainingMs <= antiSnipWindowMs;
    }

    private async placeAutoBidForConfig(input: {
        config: AutoBidConfig;
        auction: Auction;
        latestBidAmount: number | null;
    }): Promise<
        Result<{
            bid: IAutoBid | null;
            auction: Auction;
        }>
    > {
        const latestBidResult = await this._bidRepo.findLatestByAuctionId(
            input.auction.getId(),
        );
        if (latestBidResult.isFailure) {
            return Result.fail(latestBidResult.getError());
        }

        const lastUserBidResult = await this._bidRepo.findLastBidsByUser(
            input.auction.getId(),
            input.config.getUserId(),
        );
        if (lastUserBidResult.isFailure) {
            return Result.fail(lastUserBidResult.getError());
        }

        const nextMin =
            input.latestBidAmount != null
                ? input.latestBidAmount + input.auction.getMinIncrement()
                : input.auction.getStartPrice();
        if (nextMin > input.config.getMaxBidAmount()) {
            return Result.ok({ bid: null, auction: input.auction });
        }

        const placeBidStrategy = this._placeBidStartegyFactory.getStrategy(
            input.auction.getAuctionType(),
        );
        const autoBidEntity = placeBidStrategy.validateAndCreateBid({
            auction: input.auction,
            userId: input.config.getUserId(),
            amount: nextMin,
            latestBid: latestBidResult.getValue(),
            userLatestBid: lastUserBidResult.getValue(),
        });
        if (autoBidEntity.isFailure) {
            return Result.ok({ bid: null, auction: input.auction });
        }

        const newAutoBid = autoBidEntity.getValue();
        const shouldExtend = ShouldExtendAuctionPolicy.shouldExtendAuction(
            input.auction,
            input.auction.getEndAt().getTime() - Date.now(),
        );

        let auctionForOutput = input.auction;
        if (shouldExtend) {
            const updatedAuctionRes = Auction.create({
                id: input.auction.getId(),
                sellerId: input.auction.getSellerId(),
                auctionType: input.auction.getAuctionType(),
                title: input.auction.getTitle(),
                description: input.auction.getDescription(),
                category: input.auction.getCategory(),
                condition: input.auction.getCondition(),
                startPrice: input.auction.getStartPrice(),
                minIncrement: input.auction.getMinIncrement(),
                startAt: input.auction.getStartAt(),
                endAt: new Date(
                    input.auction.getEndAt().getTime() +
                        input.auction.getAntiSnipSeconds() * 1000,
                ),
                antiSnipSeconds: input.auction.getAntiSnipSeconds(),
                extensionCount: input.auction.getExtensionCount() + 1,
                maxExtensionCount: input.auction.getMaxExtensionCount(),
                bidCooldownSeconds: input.auction.getBidCooldownSeconds(),
                status: input.auction.getStatus(),
                winnerId: input.auction.getWinnerId(),
                winAmount: input.auction.getWinAmount(),
                assets: input.auction.getAssets(),
            });
            if (updatedAuctionRes.isFailure) {
                return Result.fail(updatedAuctionRes.getError());
            }

            const saveAuctionRes = await this._auctionRepo.save(
                updatedAuctionRes.getValue(),
            );
            if (saveAuctionRes.isFailure) {
                return Result.fail(saveAuctionRes.getError());
            }
            auctionForOutput = saveAuctionRes.getValue();
        }

        const createBidResult = await this._bidRepo.create(newAutoBid);
        if (createBidResult.isFailure) {
            return Result.fail(createBidResult.getError());
        }

        return Result.ok({
            bid: {
                id: newAutoBid.getId(),
                auctionId: newAutoBid.getAuctionId(),
                userId: newAutoBid.getUserId(),
                amount: newAutoBid.getAmount(),
                createdAt: newAutoBid.getCreatedAt().toISOString(),
                endAt: auctionForOutput.getEndAt().toISOString(),
                extensionCount: auctionForOutput.getExtensionCount(),
            },
            auction: auctionForOutput,
        });
    }

    async handleAuctionPlaceBid(input: {
        auction: Auction;
        latestBidAmount: number | null;
        triggeringUserId: string;
    }): Promise<
        Result<{
            placedBids: IAutoBid[];
        }>
    > {
        const placedBids: IAutoBid[] = [];

        if (input.auction.getAuctionType() !== AuctionType.LONG) {
            return Result.ok({ placedBids: [] });
        }

        const participantsResult = await this._participantRepo.findByAuctionId(
            input.auction.getId(),
        );
        if (participantsResult.isFailure) {
            return Result.fail(participantsResult.getError());
        }

        const participants = participantsResult.getValue();
        const activeConfigsResult =
            await this._autoBidConfigRepository.findActiveByAuctionId(
                input.auction.getId(),
            );
        if (activeConfigsResult.isFailure) {
            return Result.fail(activeConfigsResult.getError());
        }

        const sortedConfigs = activeConfigsResult.getValue();

        if (this.isBidInAntiSnippingTime(input.auction)) {
            const topPriorityConfig = sortedConfigs[0] ?? null;

            if (topPriorityConfig) {
                const placeResult = await this.placeAutoBidForConfig({
                    config: topPriorityConfig,
                    auction: input.auction,
                    latestBidAmount: input.latestBidAmount,
                });
                if (placeResult.isFailure) {
                    console.log(
                        'PLACE RESULT AUTOBID ERROR ERROR: ',
                        placeResult.getError(),
                    );
                }
                const placed = placeResult.getValue().bid;
                if (placed) placedBids.push(placed);
            }

            const disableAllResult =
                await this._autoBidConfigRepository.disableAllActiveByAuctionId(
                    input.auction.getId(),
                );
            if (disableAllResult.isFailure) {
                return Result.fail(disableAllResult.getError());
            }

            return Result.ok({ placedBids });
        }

        let currentAmount = input.latestBidAmount;
        let currentTriggeringUserId = input.triggeringUserId;
        let currentAuction = input.auction;

        for (const config of sortedConfigs) {
            if (!config.getIsActive()) continue;
            if (config.getUserId() === currentTriggeringUserId) continue;

            const participant = participants.find(
                (p) => p.getUserId() === config.getUserId(),
            );
            if (
                !participant ||
                participant.getIntialAmount() !==
                    AuctionParticipantPaymentStatus.PAID
            ) {
                continue;
            }

            const placeResult = await this.placeAutoBidForConfig({
                config,
                auction: currentAuction,
                latestBidAmount: currentAmount,
            });
            if (placeResult.isFailure) continue;

            const placed = placeResult.getValue().bid;
            if (!placed) continue;

            placedBids.push(placed);
            currentAmount = placed.amount;
            currentTriggeringUserId = placed.userId;
            currentAuction = placeResult.getValue().auction;
        }

        return Result.ok({ placedBids });
    }
}

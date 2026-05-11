import { ISubscriptionConfigService } from '@application/interfaces/services/ISubscriptionConfigService';
import { TYPES } from '@di/types.di';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';

import { inject, injectable } from 'inversify';
import { ICacheService } from '@application/interfaces/services/ICacheService';
import { CACHE_CONSTANTS } from '@application/constants/cache/cache.conatants';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import { SubscriptionFeatureKey } from '@domain/entities/subscription/features.entity';
import { SUBSCRIPTION_CONSTANTS } from '@domain/constants/subscription.constants';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { SubscriptionPlanMapper } from '@infrastructure/mappers/subscription/subscription-plan.mapper';

@injectable()
export class SubscriptionConfigService implements ISubscriptionConfigService {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
        @inject(TYPES.IUserSubscriptionRepository)
        private readonly _userSubscriptionRepository: IUserSubscriptionRepository,
        @inject(TYPES.ICacheService)
        private readonly _cacheService: ICacheService,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IBidRepository)
        private readonly _bidRepository: IBidRepository,
        @inject(TYPES.SubscriptionPlanMapper)
        private readonly _subscriptionPlanMapper: SubscriptionPlanMapper,
    ) {}

    async canCreateAuction(userId: string): Promise<Result<boolean>> {
        const subscriptionPlanResult =
            await this.getUserSubscriptionPlan(userId);

        if (subscriptionPlanResult.isFailure) {
            return Result.fail(subscriptionPlanResult.getError());
        }

        const subscriptionPlan = subscriptionPlanResult.getValue();
        console.log(
            'subscriptionPlan INside subscription config --==',
            subscriptionPlan,
        );

        if (!subscriptionPlan) {
            return Result.fail('Subscription plan not found');
        }

        // console.log('subscriptionPlan.getFeatures() INside subscription config --==', subscriptionPlan.getFeatures().map(feature => feature.getFeature().getFeatureKey()));

        const auctionCreateFeatureValue =
            subscriptionPlan
                .getFeatures()
                .find(
                    (feature) =>
                        feature.getFeature().getFeatureKey() ===
                        SubscriptionFeatureKey.AUCTION_CREATION,
                )
                ?.getValue() ??
            SUBSCRIPTION_CONSTANTS.DEFAULT_AUCTION_CREATE_FEATURE_VALUE;

        const totalCreatedAuctions =
            await this._auctionRepository.countBySellerId(userId);

        if (totalCreatedAuctions.isFailure) {
            return Result.fail(totalCreatedAuctions.getError());
        }

        if (
            totalCreatedAuctions.getValue() >= Number(auctionCreateFeatureValue)
        ) {
            return Result.fail(
                'You have reached the maximum number of auctions you can create with your subscription plan',
            );
        }

        return Result.ok(true);
    }

    async canPlaceBid(
        userId: string,
        auctionId: string,
    ): Promise<Result<boolean>> {
        const subscriptionPlanResult =
            await this.getUserSubscriptionPlan(userId);
        if (subscriptionPlanResult.isFailure) {
            return Result.fail(subscriptionPlanResult.getError());
        }

        const subscriptionPlan = subscriptionPlanResult.getValue();
        if (!subscriptionPlan) {
            return Result.fail('Subscription plan not found');
        }

        const auctionBiddingFeatureValue =
            subscriptionPlan
                .getFeatures()
                .find(
                    (feature) =>
                        feature.getFeature().getFeatureKey() ===
                        SubscriptionFeatureKey.AUCTION_BIDDING,
                )
                ?.getValue() ??
            SUBSCRIPTION_CONSTANTS.DEFAULT_AUCTION_BIDDING_FEATURE_VALUE;

        const totalBidsOfUserForAuction =
            await this._bidRepository.countBidsByAuctionIdAndUserId(
                auctionId,
                userId,
            );

        if (totalBidsOfUserForAuction.isFailure) {
            return Result.fail(totalBidsOfUserForAuction.getError());
        }

        if (
            totalBidsOfUserForAuction.getValue() >=
            Number(auctionBiddingFeatureValue)
        ) {
            return Result.fail(
                'You have reached the maximum number of bids you can place for this auction with your current plan',
            );
        }

        return Result.ok(true);
    }

    private async getUserSubscriptionPlan(
        userId: string,
    ): Promise<Result<SubscriptionPlan>> {
        const userSubscriptionResult =
            await this._userSubscriptionRepository.findCurrentActiveByUserId(
                userId,
            );

        if (userSubscriptionResult.isFailure) {
            return Result.fail(userSubscriptionResult.getError());
        }

        const userSubscription = userSubscriptionResult.getValue();

        if (!userSubscription) {
            return Result.fail('user subscription not found');
        }

        const cachedResult = await this._cacheService.get(
            CACHE_CONSTANTS.SUBSCRIPTION_PLAN_KEY(
                userSubscription.getSubscriptionPlanId(),
            ),
        );
        if (cachedResult.isFailure) {
            return Result.fail(cachedResult.getError());
        }

        let cachedSubscriptionPlan = cachedResult.getValue();

        if (!cachedSubscriptionPlan) {
            const dbSubscriptionPlanResult =
                await this._subscriptionPlanRepository.findById(
                    userSubscription.getSubscriptionPlanId(),
                );

            if (dbSubscriptionPlanResult.isFailure) {
                return Result.fail(dbSubscriptionPlanResult.getError());
            }

            const dbSubscriptionPlan = dbSubscriptionPlanResult.getValue();

            if (!dbSubscriptionPlan) {
                return Result.fail('Subscription plan not found -- v1');
            }

            const jsonSubscriptionPlan = JSON.stringify(dbSubscriptionPlan);

            await this._cacheService.set(
                CACHE_CONSTANTS.SUBSCRIPTION_PLAN_KEY(
                    userSubscription.getSubscriptionPlanId(),
                ),
                jsonSubscriptionPlan,
                CACHE_CONSTANTS.SUBSCRIPTION_PLAN_TTL,
            );

            cachedSubscriptionPlan = jsonSubscriptionPlan;
        }

        console.log('jsonSubscriptionPla===', cachedSubscriptionPlan);
        const plainObject = JSON.parse(cachedSubscriptionPlan);

        // doubt -- change==
        const subscriptionPlanMapped =
            this._subscriptionPlanMapper.toDomain(plainObject);

        const subscriptionPlanEntity = subscriptionPlanMapped;

        console.log(
            'subscriptionPlanEntity INside subscription config --==',
            subscriptionPlanEntity,
        );

        if (subscriptionPlanEntity.isFailure) {
            return Result.fail('error with the subscription plan entity');
        }

        return Result.ok(subscriptionPlanEntity.getValue());
    }
}

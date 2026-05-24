import { ISubscriptionConfigService } from '@application/interfaces/services/ISubscriptionConfigService';
import { TYPES } from '@di/types.di';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';

import { inject, injectable } from 'inversify';
import { ICacheService } from '@application/interfaces/services/ICacheService';
import { CACHE_CONSTANTS } from '@application/constants/cache/cache.conatants';
import { SubscriptionPlan } from '@domain/entities/subscription/subscription-plan.entity';
import {
    SubscriptionFeatureKey,
    SubscriptionFeatureValueType,
} from '@domain/entities/subscription/features.entity';
import { SubscriptionPlanFeature } from '@domain/entities/subscription/subscriptionPlanFetaure.entity';
import { SUBSCRIPTION_CONSTANTS } from '@domain/constants/subscription.constants';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import {
    PrismaSubscriptionPlanWithFeatures,
    SubscriptionPlanMapper,
} from '@infrastructure/mappers/subscription/subscription-plan.mapper';

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

        const limit = this.getNumericLimit(
            subscriptionPlan.getFeatures(),
            SubscriptionFeatureKey.AUCTION_CREATION,
            SUBSCRIPTION_CONSTANTS.DEFAULT_AUCTION_CREATE_FEATURE_VALUE,
        );

        if (limit <= 0) {
            return Result.fail(
                'Auction creation is not included in your current subscription plan',
            );
        }

        const totalCreatedAuctions =
            await this._auctionRepository.countBySellerId(userId);

        if (totalCreatedAuctions.isFailure) {
            return Result.fail(totalCreatedAuctions.getError());
        }

        if (totalCreatedAuctions.getValue() >= limit) {
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

        const limit = this.getNumericLimit(
            subscriptionPlan.getFeatures(),
            SubscriptionFeatureKey.AUCTION_BIDDING,
            SUBSCRIPTION_CONSTANTS.DEFAULT_AUCTION_BIDDING_FEATURE_VALUE,
        );

        if (limit <= 0) {
            return Result.fail(
                'Bidding is not included in your current subscription plan',
            );
        }

        const totalBidsOfUserForAuction =
            await this._bidRepository.countBidsByAuctionIdAndUserId(
                auctionId,
                userId,
            );

        if (totalBidsOfUserForAuction.isFailure) {
            return Result.fail(totalBidsOfUserForAuction.getError());
        }

        if (totalBidsOfUserForAuction.getValue() >= limit) {
            return Result.fail(
                'You have reached the maximum number of bids you can place for this auction with your current plan',
            );
        }

        return Result.ok(true);
    }

    async canUseAiAgent(userId: string): Promise<Result<boolean>> {
        const subscriptionPlanResult =
            await this.getUserSubscriptionPlan(userId);

        if (subscriptionPlanResult.isFailure) {
            return Result.fail(subscriptionPlanResult.getError());
        }

        const subscriptionPlan = subscriptionPlanResult.getValue();
        if (!subscriptionPlan) {
            return Result.fail('Subscription plan not found');
        }

        const aiFeature = subscriptionPlan
            .getFeatures()
            .find(
                (feature) =>
                    feature.getFeature().getFeatureKey() ===
                    SubscriptionFeatureKey.AI_AGENT,
            );

        return Result.ok(this.isFeatureEnabled(aiFeature));
    }

    private isFeatureEnabled(
        planFeature: SubscriptionPlanFeature | undefined,
    ): boolean {
        if (!planFeature) return false;

        const raw = planFeature.getValue().trim().toLowerCase();
        const type = planFeature.getFeature().getType();

        if (type === SubscriptionFeatureValueType.BOOLEAN) {
            return ['true', '1', 'yes'].includes(raw);
        }

        const n = Number(raw);
        return Number.isFinite(n) && n > 0;
    }

    private getNumericLimit(
        features: SubscriptionPlanFeature[],
        key: SubscriptionFeatureKey,
        defaultValue: number,
    ): number {
        const planFeature = features.find(
            (f) => f.getFeature().getFeatureKey() === key,
        );
        if (!planFeature) return defaultValue;

        const n = Number(planFeature.getValue().trim());
        return Number.isFinite(n) && n >= 0 ? n : defaultValue;
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

        const planId = userSubscription.getSubscriptionPlanId();
        const cacheKey = CACHE_CONSTANTS.SUBSCRIPTION_PLAN_KEY(planId);

        const cachedResult = await this._cacheService.get(cacheKey);
        if (cachedResult.isFailure) {
            return Result.fail(cachedResult.getError());
        }

        let cachedSubscriptionPlan = cachedResult.getValue();

        const loadAndCachePlan = async (): Promise<Result<string>> => {
            const dbSubscriptionPlanResult =
                await this._subscriptionPlanRepository.findById(planId);

            if (dbSubscriptionPlanResult.isFailure) {
                return Result.fail(dbSubscriptionPlanResult.getError());
            }

            const dbSubscriptionPlan = dbSubscriptionPlanResult.getValue();
            if (!dbSubscriptionPlan) {
                return Result.fail('Subscription plan not found -- v1');
            }

            const jsonSubscriptionPlan = JSON.stringify(
                this._subscriptionPlanMapper.toPersistence(dbSubscriptionPlan),
            );

            await this._cacheService.set(
                cacheKey,
                jsonSubscriptionPlan,
                CACHE_CONSTANTS.SUBSCRIPTION_PLAN_TTL,
            );

            return Result.ok(jsonSubscriptionPlan);
        };

        if (!cachedSubscriptionPlan) {
            const loaded = await loadAndCachePlan();
            if (loaded.isFailure) return Result.fail(loaded.getError());
            cachedSubscriptionPlan = loaded.getValue();
        }

        let plainObject = JSON.parse(cachedSubscriptionPlan) as {
            features?: unknown[];
        };

        if (
            !Array.isArray(plainObject.features) ||
            plainObject.features.length === 0
        ) {
            const reloaded = await loadAndCachePlan();
            if (reloaded.isFailure) return Result.fail(reloaded.getError());
            cachedSubscriptionPlan = reloaded.getValue();
            plainObject = JSON.parse(cachedSubscriptionPlan);
        }

        const subscriptionPlanMapped = this._subscriptionPlanMapper.toDomain(
            plainObject as PrismaSubscriptionPlanWithFeatures,
        );

        if (subscriptionPlanMapped.isFailure) {
            return Result.fail('error with the subscription plan entity');
        }

        return Result.ok(subscriptionPlanMapped.getValue());
    }
}

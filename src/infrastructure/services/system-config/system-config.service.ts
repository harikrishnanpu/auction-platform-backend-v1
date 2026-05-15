// import { ISystemConfigDto } from '@application/dtos/admin/systemConfig.dto';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import { CACHE_CONSTANTS } from '@application/constants/cache/cache.conatants';
import { ICacheService } from '@application/interfaces/services/ICacheService';
import { TYPES } from '@di/types.di';
import {
    // SystemConfig,
    SystemConfigKey,
    SystemConfigValueType,
} from '@domain/entities/system-config/system-config.entity';
import { ISystemConfigRepository } from '@domain/repositories/ISystemConfigRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class SystemConfigService implements ISystemConfigService {
    constructor(
        @inject(TYPES.ISystemConfigRepository)
        private readonly _systemConfigRepository: ISystemConfigRepository,
        @inject(TYPES.ICacheService)
        private readonly _cacheService: ICacheService,
    ) {}

    // async getConfigByKey(
    //     key: SystemConfigKey,
    // ): Promise<Result<ISystemConfigDto>> {
    //     const configResult = await this._systemConfigRepository.findByKey(key);
    //     if (configResult.isFailure) return Result.fail(configResult.getError());

    //     const config = configResult.getValue();
    //     if (!config) {
    //         return Result.fail('System config not found');
    //     }

    //     return this.toDto(config);
    // }

    async revalidateChache(key: SystemConfigKey): Promise<Result<void>> {
        const cacheKey = CACHE_CONSTANTS.SYSTEM_CONFIG_NUMERIC_KEY(key);
        return this._cacheService.remove(cacheKey);
    }

    async getFraudSuspensionThreshold(): Promise<Result<number>> {
        return this.getCachedNumValue(
            SystemConfigKey.FRAUD_SUSPENSION_THRESHOLD,
        );
    }

    async getFraudTemporarySuspensionDurationMs(): Promise<Result<number>> {
        return this.getCachedNumValue(
            SystemConfigKey.FRAUD_TEMPORARY_SUSPENSION_DURATION_MS,
        );
    }

    async getAuctionMinStartPrice(): Promise<Result<number>> {
        return this.getCachedNumValue(SystemConfigKey.AUCTION_MIN_START_PRICE);
    }

    async getAuctionMaxMaxExtensionCount(): Promise<Result<number>> {
        return this.getCachedNumValue(
            SystemConfigKey.AUCTION_MAX_MAX_EXTENSION_COUNT,
        );
    }

    async getAuctionPaymentDepositDueMs(): Promise<Result<number>> {
        return this.getCachedNumValue(
            SystemConfigKey.AUCTION_PAYMENT_DEPOSIT_DUE_MS,
        );
    }

    async getAuctionPaymentBalanceDueMs(): Promise<Result<number>> {
        return this.getCachedNumValue(
            SystemConfigKey.AUCTION_PAYMENT_BALANCE_DUE_MS,
        );
    }

    async getAuctionWinnerDepositSplitRatio(): Promise<Result<number>> {
        return this.getCachedNumValue(
            SystemConfigKey.AUCTION_WINNER_DEPOSIT_SPLIT_RATIO,
        );
    }

    async getAuctionParticipantInitialDepositRatio(): Promise<Result<number>> {
        return this.getCachedNumValue(
            SystemConfigKey.AUCTION_PARTICIPANT_INITIAL_DEPOSIT_RATIO,
        );
    }

    async getAuctionPublicFallbackInitialSplitRatio(): Promise<Result<number>> {
        return this.getCachedNumValue(
            SystemConfigKey.AUCTION_PUBLIC_FALLBACK_INITIAL_SPLIT_RATIO,
        );
    }

    async getAuctionPublicFallbackRemainingSplitRatio(): Promise<
        Result<number>
    > {
        return this.getCachedNumValue(
            SystemConfigKey.AUCTION_PUBLIC_FALLBACK_REMAINING_SPLIT_RATIO,
        );
    }

    async getAuctionWinnerFallbackMaxRank(): Promise<Result<number>> {
        return this.getCachedNumValue(
            SystemConfigKey.AUCTION_WINNER_FALLBACK_MAX_RANK,
        );
    }

    private async getCachedNumValue(
        key: SystemConfigKey,
    ): Promise<Result<number>> {
        const cacheKey = CACHE_CONSTANTS.SYSTEM_CONFIG_NUMERIC_KEY(key);

        const cachedResult = await this._cacheService.get(cacheKey);
        if (cachedResult.isFailure) {
            return Result.fail(cachedResult.getError());
        }

        const cached = cachedResult.getValue();
        if (cached && cached !== '') {
            const parsed = Number(cached);
            if (!Number.isNaN(parsed)) {
                return Result.ok(parsed);
            }
        }

        const configResult = await this._systemConfigRepository.findByKey(key);
        if (configResult.isFailure) {
            return Result.fail(configResult.getError());
        }

        const config = configResult.getValue();
        if (!config) {
            return Result.fail('System config not found');
        }

        if (config.getValueType() !== SystemConfigValueType.NUMBER) {
            return Result.fail(`System config ${key} must be NUMBER`);
        }

        const value = Number(config.getValue());
        if (Number.isNaN(value)) {
            return Result.fail(`Invalid numeric system config: ${key}`);
        }

        await this._cacheService.set(
            cacheKey,
            String(value),
            CACHE_CONSTANTS.SYSTEM_CONFIG_NUMERIC_TTL_SECONDS,
        );

        return Result.ok(value);
    }

    // - old plan ......

    // private toDto(config: SystemConfig): Result<ISystemConfigDto> {
    //     const valueType = config.getValueType();
    //     let value: string | number | boolean = config.getValue();

    //     switch (valueType) {
    //         case SystemConfigValueType.NUMBER:
    //             value = Number(value);
    //             break;
    //         case SystemConfigValueType.BOOLEAN:
    //             value = config.getValue().trim().toLowerCase() === 'true';
    //             break;
    //     }

    //     return Result.ok({
    //         id: config.getId(),
    //         key: config.getKey(),
    //         value: value,
    //         valueType: config.getValueType(),
    //         description: config.getDescription(),
    //         createdAt: config.getCreatedAt(),
    //         updatedAt: config.getUpdatedAt(),
    //     });
    // }
}

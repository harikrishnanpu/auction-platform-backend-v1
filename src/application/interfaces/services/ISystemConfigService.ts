import { Result } from '@domain/shared/result';
import { SystemConfigKey } from '@domain/entities/system-config/system-config.entity';
// import { ISystemConfigDto } from '@application/dtos/admin/systemConfig.dto';

export interface ISystemConfigService {
    // getConfigByKey(key: SystemConfigKey): Promise<Result<ISystemConfigDto>>;

    revalidateChache(key: SystemConfigKey): Promise<Result<void>>;

    getFraudSuspensionThreshold(): Promise<Result<number>>;
    getFraudTemporarySuspensionDurationMs(): Promise<Result<number>>;

    getAuctionMinStartPrice(): Promise<Result<number>>;
    getAuctionMaxMaxExtensionCount(): Promise<Result<number>>;

    getAuctionPaymentDepositDueMs(): Promise<Result<number>>;
    getAuctionPaymentBalanceDueMs(): Promise<Result<number>>;
    getAuctionWinnerDepositSplitRatio(): Promise<Result<number>>;
    getAuctionParticipantInitialDepositRatio(): Promise<Result<number>>;
    getAuctionPublicFallbackInitialSplitRatio(): Promise<Result<number>>;
    getAuctionPublicFallbackRemainingSplitRatio(): Promise<Result<number>>;
    getAuctionWinnerFallbackMaxRank(): Promise<Result<number>>;
}

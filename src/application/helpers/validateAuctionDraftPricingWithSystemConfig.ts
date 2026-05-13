import type { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import { Result } from '@domain/shared/result';

export async function validateAuctionDraftPricingWithSystemConfig(
    systemConfig: ISystemConfigService,
    params: { startPrice: number; maxExtensionCount: number },
): Promise<Result<void>> {
    const [minRes, maxRes] = await Promise.all([
        systemConfig.getAuctionMinStartPrice(),
        systemConfig.getAuctionMaxMaxExtensionCount(),
    ]);

    if (minRes.isFailure) {
        return Result.fail(minRes.getError());
    }
    if (maxRes.isFailure) {
        return Result.fail(maxRes.getError());
    }

    const minStart = minRes.getValue();
    const maxExt = maxRes.getValue();

    if (params.startPrice < minStart) {
        return Result.fail(`Start price must be greater than ${minStart}`);
    }

    if (params.maxExtensionCount > maxExt) {
        return Result.fail(`Max extension count must be less than ${maxExt}`);
    }

    return Result.ok();
}

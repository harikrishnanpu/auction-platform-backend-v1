import { ICreateAuctionPolicyInput } from '@application/factories/auctionCreatePolicy.factory';
import { Result } from '@domain/shared/result';

export class LongAuctionCreatePolicy {
    public validate(
        data: ICreateAuctionPolicyInput,
    ): Result<ICreateAuctionPolicyInput> {
        if (data.minIncrement < 1) {
            return Result.fail('Min increment must be greater than 1');
        }

        if (data.maxExtensionCount > 10) {
            return Result.fail('Max extension count must be less than 10');
        }

        if (data.maxExtensionCount < 0) {
            return Result.fail('Max extension count must be greater than 0');
        }

        const validatedResult = {
            auctionType: data.auctionType,
            title: data.title,
            description: data.description,
            categoryId: data.categoryId,
            condition: data.condition,
            startPrice: data.startPrice,
            minIncrement: data.minIncrement,
            startAt: data.startAt,
            endAt: data.endAt,
            antiSnipSeconds: data.antiSnipSeconds,
            maxExtensionCount: data.maxExtensionCount,
            bidCooldownSeconds: data.bidCooldownSeconds,
            assets: data.assets,
            userId: data.userId,
        };

        return Result.ok(validatedResult);
    }
}

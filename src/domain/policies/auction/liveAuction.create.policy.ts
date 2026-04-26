import { ICreateAuctionPolicyInput } from '@application/factories/auctionCreatePolicy.factory';
import { Result } from '@domain/shared/result';

export class LiveAuctionCreatePolicy {
    public validate(
        data: ICreateAuctionPolicyInput,
    ): Result<ICreateAuctionPolicyInput> {
        if (data.startPrice < 500) {
            return Result.fail('Start price must be greater than 500');
        }

        if (data.minIncrement < 1) {
            return Result.fail('Min increment must be greater than 0');
        }

        if (data.maxExtensionCount > 10) {
            return Result.fail('Max extension count must be less than 10');
        }

        if (data.maxExtensionCount < 0) {
            return Result.fail('Max extension count must be greater than 0');
        }

        if (
            new Date(data.startAt).getTime() - new Date(data.endAt).getTime() >
            24 * 60 * 60 * 1000
        ) {
            return Result.fail(
                'Start time must be within 24 hours of end time',
            );
        }

        const validatedResult = {
            auctionType: data.auctionType,
            title: data.title,
            description: data.description,
            categoryId: data.categoryId,
            condition: data.condition,
            startPrice: data.startPrice,
            startAt: data.startAt,
            endAt: data.endAt,
            minIncrement: data.minIncrement,
            antiSnipSeconds: data.antiSnipSeconds,
            maxExtensionCount: data.maxExtensionCount,
            bidCooldownSeconds: data.bidCooldownSeconds,
            assets: data.assets,
            userId: data.userId,
        };

        return Result.ok(validatedResult);
    }
}

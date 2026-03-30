import { ICreateAuctionPolicyInput } from '@application/factories/auctionCreatePolicy.factory';
import { Result } from '@domain/shared/result';

export class SealedAuctionCreatePolicy {
    public validate(
        data: ICreateAuctionPolicyInput,
    ): Result<ICreateAuctionPolicyInput> {
        const validatedResult = {
            auctionType: data.auctionType,
            title: data.title,
            description: data.description,
            categoryId: data.categoryId,
            condition: data.condition,
            startPrice: data.startPrice,
            startAt: data.startAt,
            endAt: data.endAt,
            minIncrement: 0,
            antiSnipSeconds: 0,
            maxExtensionCount: 0,
            bidCooldownSeconds: 0,
            assets: data.assets,
            userId: data.userId,
        };

        return Result.ok(validatedResult);
    }
}

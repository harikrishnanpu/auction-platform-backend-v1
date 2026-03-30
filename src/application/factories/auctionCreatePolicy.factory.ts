import { AuctionType } from '@domain/entities/auction/auction.entity';
import { LongAuctionCreatePolicy } from '@domain/policies/auction/longAuction.create.policy';
import { SealedAuctionCreatePolicy } from '@domain/policies/auction/sealedAuction.create.policy';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import { AuctionAssetType } from '@domain/entities/auction/auction-asset.entity';

export interface ICreateAuctionPolicyInput {
    userId: string;
    auctionType: AuctionType;
    title: string;
    description: string;
    categoryId: string;
    condition: string;
    startPrice: number;
    minIncrement: number;
    startAt: Date;
    endAt: Date;
    antiSnipSeconds: number;
    maxExtensionCount: number;
    bidCooldownSeconds: number;
    assets: {
        fileKey: string;
        position?: number;
        assetType?: AuctionAssetType;
    }[];
}

@injectable()
export class AuctionCreatePolicyFactory {
    constructor(
        @inject(TYPES.LongAuctionCreatePolicy)
        private readonly _longAuctionCreatePolicy: LongAuctionCreatePolicy,
        @inject(TYPES.SealedAuctionCreatePolicy)
        private readonly _sealedAuctionCreatePolicy: SealedAuctionCreatePolicy,
    ) {}

    validate(
        input: ICreateAuctionPolicyInput,
    ): Result<ICreateAuctionPolicyInput> {
        switch (input.auctionType) {
            case AuctionType.LONG:
                return this._longAuctionCreatePolicy.validate(input);
            case AuctionType.SEALED:
                return this._sealedAuctionCreatePolicy.validate(input);
            default:
                return this._longAuctionCreatePolicy.validate(input);
        }
    }
}

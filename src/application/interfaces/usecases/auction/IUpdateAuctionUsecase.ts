import { IUpdateAuctionOutput } from '@application/dtos/auction/update-auction.dto';
import { AuctionAssetType } from '@domain/entities/auction/auction-asset.entity';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { Result } from '@domain/shared/result';

export interface IValidatedUpdateAuctionInput {
    auctionId: string;
    userId: string;
    auctionType?: AuctionType;
    title: string;
    description: string;
    category: string;
    condition: string;
    startPrice: number;
    minIncrement: number;
    startAt: Date;
    endAt: Date;
    antiSnipSeconds?: number;
    maxExtensionCount?: number;
    bidCooldownSeconds?: number;
    assets?: {
        fileKey: string;
        position?: number;
        assetType?: AuctionAssetType;
    }[];
}

export interface IUpdateAuctionUsecase {
    execute(
        input: IValidatedUpdateAuctionInput,
    ): Promise<Result<IUpdateAuctionOutput>>;
}

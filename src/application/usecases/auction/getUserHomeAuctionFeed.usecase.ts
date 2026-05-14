import { IGetUserHomeAuctionFeedOutputDto } from '@application/dtos/auction/getUserHomeAuctionFeed.dto';
import type {
    IGetUserHomeAuctionFeedUsecase,
    IValidatedGetUserHomeAuctionFeedInput,
} from '@application/interfaces/usecases/auction/IGetUserHomeAuctionFeedUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetUserHomeAuctionFeedUsecase implements IGetUserHomeAuctionFeedUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: IValidatedGetUserHomeAuctionFeedInput,
    ): Promise<Result<IGetUserHomeAuctionFeedOutputDto>> {
        const { liveLimit, longSealedLimit } = input;

        const [liveRes, longRes, sealedRes] = await Promise.all([
            this._auctionRepository.findAllForUsers({
                scope: 'ending_soon',
                page: 1,
                limit: liveLimit,
                auctionType: AuctionType.LIVE,
                sort: 'endAt',
                order: 'asc',
            }),
            this._auctionRepository.findAllForUsers({
                scope: 'ending_soon',
                page: 1,
                limit: longSealedLimit,
                auctionType: AuctionType.LONG,
                sort: 'endAt',
                order: 'asc',
            }),
            this._auctionRepository.findAllForUsers({
                scope: 'ending_soon',
                page: 1,
                limit: longSealedLimit,
                auctionType: AuctionType.SEALED,
                sort: 'endAt',
                order: 'asc',
            }),
        ]);

        if (liveRes.isFailure) return Result.fail(liveRes.getError());
        if (longRes.isFailure) return Result.fail(longRes.getError());
        if (sealedRes.isFailure) return Result.fail(sealedRes.getError());

        const longAndSealed = [...longRes.getValue(), ...sealedRes.getValue()]
            .sort((a, b) => a.getEndAt().getTime() - b.getEndAt().getTime())
            .slice(0, longSealedLimit);

        return Result.ok({
            liveAuctions: liveRes
                .getValue()
                .map((a) => AuctionMapperProrfile.toAuctionOutputDto(a)),
            longAndSealedAuctions: longAndSealed.map((a) =>
                AuctionMapperProrfile.toAuctionOutputDto(a),
            ),
        });
    }
}

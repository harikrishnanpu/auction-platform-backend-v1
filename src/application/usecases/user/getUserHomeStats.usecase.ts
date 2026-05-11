import {
    IGetUserHomeStatsInputDto,
    IGetUserHomeStatsOutputDto,
} from '@application/dtos/user/getUserHomeStats.dto';
import { IGetUserHomeStatsUsecase } from '@application/interfaces/usecases/user/IGetUserHomeStatsUsecase';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetUserHomeStatsUsecase implements IGetUserHomeStatsUsecase {
    constructor(
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(
        input: IGetUserHomeStatsInputDto,
    ): Promise<Result<IGetUserHomeStatsOutputDto>> {
        const [
            publicCountsResult,
            participatedCountResult,
            participationDashResult,
        ] = await Promise.all([
            this._auctionRepository.countAuctionStats(),
            this._auctionRepository.countParticipatedByUserId(input.userId),
            this._auctionRepository.getUserDahsboardAuctionStats(input.userId),
        ]);

        if (publicCountsResult.isFailure) {
            return Result.fail(publicCountsResult.getError());
        }
        if (participatedCountResult.isFailure) {
            return Result.fail(participatedCountResult.getError());
        }
        if (participationDashResult.isFailure) {
            return Result.fail(participationDashResult.getError());
        }

        const publicCounts = publicCountsResult.getValue();
        const participatedCount = participatedCountResult.getValue();
        const dash = participationDashResult.getValue();

        return Result.ok({
            liveCount: publicCounts.liveCount,
            upcomingCount: publicCounts.upcomingCount,
            endedCount: publicCounts.endedCount,
            participatedCount,
            liveWinningCount: dash.liveWinningCount,
            liveLosingCount: dash.liveLosingCount,
            wonCount: dash.wonCount,
            lostCount: dash.lostCount,
        });
    }
}

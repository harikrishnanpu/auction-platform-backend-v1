import { tool } from 'langchain';
import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';
import type { IGetUserHomeStatsUsecase } from '@application/interfaces/usecases/user/IGetUserHomeStatsUsecase';

import type { ToolPayloadDto } from '../../types/types';

@injectable()
export class GetMyAuctionOverviewTool {
    constructor(
        @inject(TYPES.IGetUserHomeStatsUsecase)
        private readonly _getHomeStats: IGetUserHomeStatsUsecase,
    ) {}

    build(payload: ToolPayloadDto) {
        const schema = z.object({});

        return tool(
            async () => {
                const r = await this._getHomeStats.execute({
                    userId: payload.userId,
                });
                if (r.isFailure) {
                    return JSON.stringify({ error: r.getError() });
                }
                return JSON.stringify(r.getValue());
            },
            {
                name: 'get_my_auction_overview',
                description:
                    'Summary counts: live, upcoming, ended, and participated auctions for the user home dashboard.',
                schema,
            },
        );
    }
}

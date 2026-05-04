import { inject, injectable } from 'inversify';

import { GetAuctionDetailsTool } from '../tools/auction/getAuctionDetails.tool';
import { GetMyAuctionOverviewTool } from '../tools/auction/getMyAuctionOverview.tool';
import { GetMyParticipatedAuctionsTool } from '../tools/auction/getMyParticipatedAuctions.tool';
import type { ToolPayloadDto } from '../types/types';

@injectable()
export class ToolFactory {
    constructor(
        @inject(GetAuctionDetailsTool)
        private readonly _getAuctionDetailsTool: GetAuctionDetailsTool,
        @inject(GetMyParticipatedAuctionsTool)
        private readonly _getMyParticipatedAuctionsTool: GetMyParticipatedAuctionsTool,
        @inject(GetMyAuctionOverviewTool)
        private readonly _getMyAuctionOverviewTool: GetMyAuctionOverviewTool,
    ) {}

    build(payload: ToolPayloadDto) {
        return [
            this._getAuctionDetailsTool.build(payload),
            this._getMyParticipatedAuctionsTool.build(payload),
            this._getMyAuctionOverviewTool.build(payload),
        ];
    }
}

import { inject, injectable } from 'inversify';

import { GetAuctionDetailsTool } from '../tools/auction/getAuctionDetails.tool';
import { GetMyAuctionOverviewTool } from '../tools/auction/getMyAuctionOverview.tool';
import { GetMyParticipatedAuctionsTool } from '../tools/auction/getMyParticipatedAuctions.tool';
import { SearchKnowledgeTool } from '../tools/knowledge/searchKnowledge.tool';
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
        @inject(SearchKnowledgeTool)
        private readonly _searchKnowledgeTool: SearchKnowledgeTool,
    ) {}

    build(payload: ToolPayloadDto) {
        return [
            this._searchKnowledgeTool.build(),
            this._getAuctionDetailsTool.build(payload),
            this._getMyParticipatedAuctionsTool.build(payload),
            this._getMyAuctionOverviewTool.build(payload),
        ];
    }
}

import { tool } from 'langchain';
import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';
import type { IGetAuctionRoomUsecase } from '@application/interfaces/usecases/auction/IGetAuctionRoomUsecase';

import type { ToolPayloadDto } from '../../types/types';

@injectable()
export class GetAuctionDetailsTool {
    constructor(
        @inject(TYPES.IGetAuctionRoomUsecase)
        private readonly _getAuctionRoom: IGetAuctionRoomUsecase,
    ) {}

    build(payload: ToolPayloadDto) {
        const schema = z.object({
            auctionId: z.uuid().describe('Auction id (UUID) to look up'),
        });

        return tool(
            async ({ auctionId }: { auctionId: string }) => {
                const r = await this._getAuctionRoom.execute({
                    userId: payload.userId,
                    auctionId,
                    mode: 'USER',
                });
                if (r.isFailure) {
                    return JSON.stringify({ error: r.getError() });
                }
                const room = r.getValue();
                return JSON.stringify({
                    auction: room.auction,
                    currentBid: room.currentBid,
                    participantCount: room.participants.length,
                    participantsPreview: room.participants.slice(0, 15),
                    soldSummary: room.soldSummary ?? null,
                    fallbackPublicParticipantStats:
                        room.fallbackPublicParticipantStats ?? null,
                });
            },
            {
                name: 'get_auction_details',
                description:
                    'Load public auction room details for an auction id (listing, status, current bid, participants count). Requires a valid auction UUID.',
                schema,
            },
        );
    }
}

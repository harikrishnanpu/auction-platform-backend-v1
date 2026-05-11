import { tool } from 'langchain';
import { z } from 'zod';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';
import type { IGetUserParticipatedAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetUserParticipatedAuctionsUsecase';

import type { ToolPayloadDto } from '../../types/types';

@injectable()
export class GetMyParticipatedAuctionsTool {
    constructor(
        @inject(TYPES.IGetUserParticipatedAuctionsUsecase)
        private readonly _getParticipatedAuctions: IGetUserParticipatedAuctionsUsecase,
    ) {}

    build(payload: ToolPayloadDto) {
        const schema = z.object({
            page: z
                .number()
                .int()
                .min(1)
                .optional()
                .describe('Page (default 1)'),
            limit: z
                .number()
                .int()
                .min(1)
                .max(25)
                .optional()
                .describe('Page size (default 10, max 25)'),
            search: z.string().optional().describe('Optional title search'),
        });

        return tool(
            async ({
                page,
                limit,
                search,
            }: {
                page?: number;
                limit?: number;
                search?: string;
            }) => {
                const safeLimit = Math.min(Math.max(limit ?? 10, 1), 25);
                const safePage = Math.max(page ?? 1, 1);
                const r = await this._getParticipatedAuctions.execute({
                    userId: payload.userId,
                    page: safePage,
                    limit: safeLimit,
                    search: search || undefined,
                    auctionType: 'ALL',
                    status: 'ALL',
                    sort: '',
                    order: 'desc',
                });
                if (r.isFailure) {
                    return JSON.stringify({ error: r.getError() });
                }
                const out = r.getValue();
                return JSON.stringify({
                    total: out.total,
                    page: out.page,
                    totalPages: out.totalPages,
                    auctions: out.auctions.map((a) => ({
                        id: a.id,
                        title: a.title,
                        status: a.status,
                        auctionType: a.auctionType,
                        endAt:
                            a.endAt instanceof Date
                                ? a.endAt.toISOString()
                                : String(a.endAt),
                    })),
                });
            },
            {
                name: 'get_my_participated_auctions',
                description:
                    'List auctions the user has participated in (bidding). Supports pagination and optional search.',
                schema,
            },
        );
    }
}

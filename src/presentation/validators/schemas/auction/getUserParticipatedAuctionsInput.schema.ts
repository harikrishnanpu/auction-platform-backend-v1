import {
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';
import z from 'zod';

export const ZodGetUserParticipatedAuctionsSchema = z.object({
    userId: z.string().trim().min(1, 'User ID is required'),
    page: z.coerce.number().min(1).max(100).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
    search: z.string().optional(),
    auctionType: z
        .enum([AuctionType.LONG, AuctionType.LIVE, AuctionType.SEALED, 'ALL'])
        .optional(),
    status: z
        .enum([
            AuctionStatus.ACTIVE,
            AuctionStatus.SOLD,
            AuctionStatus.CANCELLED,
            AuctionStatus.DRAFT,
            AuctionStatus.ENDED,
            AuctionStatus.PAUSED,
            AuctionStatus.FALLBACK_ENDED,
            AuctionStatus.FALLBACK_PUBLIC_NOTIFICATION,
            AuctionStatus.FAILED,
            'ALL',
        ])
        .optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});

export type ZodGetUserParticipatedAuctionsInputType = z.infer<
    typeof ZodGetUserParticipatedAuctionsSchema
>;

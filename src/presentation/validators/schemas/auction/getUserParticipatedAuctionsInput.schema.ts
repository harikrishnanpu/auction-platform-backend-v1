import {
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';
import z from 'zod';

export const ZodGetUserParticipatedAuctionsSchema = z.object({
    userId: z.string().trim().min(1, 'User ID is required'),
    page: z.number().min(1).max(100).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(10),
    search: z.string().optional(),
    auctionType: z.enum(AuctionType).optional(),
    status: z.enum(AuctionStatus).optional(),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional(),
});

export type ZodGetUserParticipatedAuctionsInputType = z.infer<
    typeof ZodGetUserParticipatedAuctionsSchema
>;

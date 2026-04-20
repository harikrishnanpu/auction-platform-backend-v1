import z from 'zod';

export const liveAuctionRoomJoinSocketSchema = z.object({
    auctionId: z.string().trim().min(1, 'auctionId is required'),
});

import { AuctionAssetType } from '@domain/entities/auction/auction-asset.entity';
import { AuctionType } from '@domain/entities/auction/auction.entity';
import { z } from 'zod';

const nonNegativeInt = z.number().int('Must be a whole number').min(0);

export const createAuctionSchema = z
  .object({
    auctionType: z.enum(AuctionType),
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().optional().default(''),
    categoryId: z.string().trim().min(1, 'Category ID is required'),
    condition: z.string().trim().min(1, 'Condition is required'),
    startPrice: z.number().min(0, 'Start price must be non-negative'),
    minIncrement: z.number().min(0, 'Min increment must be non-negative'),
    startAt: z.iso.datetime({
      message: 'Start time must be a valid ISO datetime',
    }),
    endAt: z.iso.datetime({ message: 'End time must be a valid ISO datetime' }),
    antiSnipSeconds: nonNegativeInt.default(60),
    maxExtensionCount: nonNegativeInt.default(3),
    bidCooldownSeconds: nonNegativeInt.default(10),

    assets: z
      .array(
        z.object({
          fileKey: z.string().trim().min(1, 'File key is required'),
          position: z.number().int().min(0, 'Position must be non-negative'),
          assetType: z.enum(AuctionAssetType, 'Asset type is required'),
        }),
      )
      .min(1, 'At least one image or video is required to create an auction')
      .refine((val) => val?.length ?? 0 > 0, {
        message: 'Assets are required',
      }),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: 'End time must be after start time',
    path: ['endAt'],
  });

export type ZodCreateAuctionInputType = z.infer<typeof createAuctionSchema>;

import { z } from 'zod';
import { AuctionAssetType } from '@domain/entities/auction/auction-asset.entity';

const nonNegativeInt = z.number().int('Must be a whole number').min(0);

export const updateAuctionSchema = z
  .object({
    auctionType: z.enum(['LONG', 'LIVE', 'SEALED']).optional(),
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().optional().default(''),
    category: z.string().trim().min(1, 'Category is required'),
    condition: z.string().trim().min(1, 'Condition is required'),
    startPrice: z.number().min(0, 'Start price must be non-negative'),
    minIncrement: z.number().min(0, 'Min increment must be non-negative'),
    startAt: z
      .string()
      .datetime({ message: 'Start time must be a valid ISO datetime' }),
    endAt: z
      .string()
      .datetime({ message: 'End time must be a valid ISO datetime' }),
    antiSnipSeconds: nonNegativeInt.optional(),
    maxExtensionCount: nonNegativeInt.optional(),
    bidCooldownSeconds: nonNegativeInt.optional(),

    assets: z
      .array(
        z.object({
          fileKey: z.string().trim().min(1, 'Asset file key is required'),
          position: z.number().int().min(0).optional(),
          assetType: z
            .enum([AuctionAssetType.IMAGE, AuctionAssetType.VIDEO])
            .optional(),
        }),
      )
      .min(1)
      .optional(),
  })
  .refine((data) => new Date(data.endAt) > new Date(data.startAt), {
    message: 'End time must be after start time',
    path: ['endAt'],
  });

export type ZodUpdateAuctionInputType = z.infer<typeof updateAuctionSchema>;

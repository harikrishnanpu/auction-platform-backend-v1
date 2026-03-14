import { z } from 'zod';

const nonNegativeInt = z.number().int('Must be a whole number').min(0);

const auctionAssetForPublish = z.object({
  id: z.string().min(1, 'Asset id is required'),
  auctionId: z.string().min(1, 'Auction id is required'),
  fileKey: z.string().trim().min(1, 'Asset file key is required'),
  position: z.number().int().min(0),
  assetType: z.enum(['IMAGE', 'VIDEO']),
});

export const publishAuctionSchema = z
  .object({
    auctionType: z.enum(['LONG', 'LIVE', 'SEALED']),
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title must be at most 200 characters'),
    description: z
      .string()
      .trim()
      .min(1, 'Description is required')
      .max(5000, 'Description must be at most 5000 characters'),
    category: z
      .string()
      .trim()
      .min(1, 'Category is required')
      .max(100, 'Category must be at most 100 characters'),
    condition: z
      .string()
      .trim()
      .min(1, 'Condition is required')
      .max(50, 'Condition must be at most 50 characters'),
    startPrice: z.number().min(1, 'Start price must be 1 or greater'),
    minIncrement: z.number().min(1, 'Min increment must be at least 1'),
    startAt: z.coerce.date({ message: 'Start time is required' }),
    endAt: z.coerce.date({ message: 'End time is required' }),
    antiSnipSeconds: nonNegativeInt.min(0).max(300),
    maxExtensionCount: nonNegativeInt.min(0).max(10),
    bidCooldownSeconds: nonNegativeInt
      .min(1, 'Bid cooldown must be at least 1 second')
      .max(120),
    assets: z
      .array(auctionAssetForPublish)
      .min(1, 'At least one image or video is required to publish'),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: 'End time must be after start time',
    path: ['endAt'],
  });

export type PublishAuctionSchemaType = z.infer<typeof publishAuctionSchema>;

export const publishAuctionParamsSchema = z.object({
  id: z.string().min(1, 'Auction id is required').trim(),
});

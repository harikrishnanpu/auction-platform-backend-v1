import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';
import { describe, expect, it } from 'vitest';

describe('AuctionCategorySlug Value Object', () => {
    it('should successfully create a valid AuctionCategorySlug value object', () => {
        const auctionCategorySlugResult =
            AuctionCategorySlug.create('electronics-123');
        expect(auctionCategorySlugResult.isSuccess).toBe(true);
        expect(auctionCategorySlugResult.getValue().getValue()).toBe(
            'electronics-123',
        );
    });

    it('should fail to create a AuctionCategorySlug value object if the slug is not provided', () => {
        const auctionCategorySlugResult = AuctionCategorySlug.create('');
        expect(auctionCategorySlugResult.isSuccess).toBe(false);
        expect(auctionCategorySlugResult.getError()).toBe(
            'Auction category slug cannot be empty',
        );
    });
});

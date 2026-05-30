import { AuctionCategory } from '@domain/entities/auction/auction-category.entity';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';
import { describe, expect, it } from 'vitest';

describe('AuctionCategory Domain Entity', () => {
    it('should successfully create a valid AuctionCategory entity', () => {
        const auctionCategoryResult = AuctionCategory.create({
            id: 'cat-1',
            name: 'Electronics',
            slug: AuctionCategorySlug.create('electronics').getValue(),
            parentId: null,
            submittedBy: 'user-1',
        });

        expect(auctionCategoryResult.isSuccess).toBe(true);
        expect(auctionCategoryResult.getValue().getId()).toBe('cat-1');
        expect(auctionCategoryResult.getValue().getName()).toBe('Electronics');
        expect(auctionCategoryResult.getValue().getSlug().getValue()).toBe(
            'electronics',
        );
    });

    it('should fail to create a AuctionCategory entity if the slug is not provided', () => {
        const auctionCategoryResult = AuctionCategory.create({
            id: 'cat-1',
            name: 'Electronics',
            slug: '',
        });
        expect(auctionCategoryResult.isSuccess).toBe(false);
        expect(auctionCategoryResult.getError()).toBe(
            'Auction category slug cannot be empty',
        );
    });
});

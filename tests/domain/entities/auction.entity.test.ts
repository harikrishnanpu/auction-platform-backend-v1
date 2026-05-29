import { describe, expect, it } from 'vitest';
import {
    Auction,
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';
import {
    AuctionCategory,
    AuctionCategoryStatus,
} from '@domain/entities/auction/auction-category.entity';
import { AuctionCategorySlug } from '@domain/value-objects/auction-category-slug.vo';

describe('Auction Domain Entity', () => {
    const slug = AuctionCategorySlug.create('slug-1').getValue();
    const category = AuctionCategory.create({
        id: 'cat-1',
        name: 'Electronics',
        slug,
        parentId: null,
        status: AuctionCategoryStatus.APPROVED,
        submittedBy: 'admin',
    }).getValue();

    const draftCategory = AuctionCategory.create({
        id: 'cat-2',
        name: 'Motors',
        slug,
        parentId: null,
        status: AuctionCategoryStatus.PENDING,
        submittedBy: 'admin',
    }).getValue();

    it('should successfully create an Auction with approved category', () => {
        const auctionResult = Auction.create({
            id: 'auc-1',
            auctionNumber: 'AUC-1001',
            sellerId: 'seller-1',
            auctionType: AuctionType.LONG,
            title: 'Vase',
            description: 'Ancient vase',
            category,
            condition: 'Good',
            startPrice: 100,
            minIncrement: 5,
            startAt: new Date(),
            endAt: new Date(Date.now() + 86400000),
        });

        expect(auctionResult.isSuccess).toBe(true);
        expect(auctionResult.getValue().getStartPrice()).toBe(100);
        expect(auctionResult.getValue().getStatus()).toBe(AuctionStatus.DRAFT);
    });

    it('should fail to create an Auction if category is not approved', () => {
        const auctionResult = Auction.create({
            id: 'auc-1',
            auctionNumber: 'AUC-1001',
            sellerId: 'seller-1',
            auctionType: AuctionType.LONG,
            title: 'Vase',
            description: 'Ancient vase',
            category: draftCategory,
            condition: 'Good',
            startPrice: 100,
            minIncrement: 5,
            startAt: new Date(),
            endAt: new Date(Date.now() + 86400000),
        });

        expect(auctionResult.isSuccess).toBe(false);
        expect(auctionResult.getError()).toBe(
            'Auction category is not approved',
        );
    });

    it('should support updating status', () => {
        const auction = Auction.create({
            id: 'auc-1',
            auctionNumber: 'AUC-1001',
            sellerId: 'seller-1',
            auctionType: AuctionType.LONG,
            title: 'Vase',
            description: 'Ancient vase',
            category,
            condition: 'Good',
            startPrice: 100,
            minIncrement: 5,
            startAt: new Date(),
            endAt: new Date(Date.now() + 86400000),
        }).getValue();

        const statusResult = auction.setStatus(AuctionStatus.ACTIVE);
        expect(statusResult.isSuccess).toBe(true);
        expect(auction.getStatus()).toBe(AuctionStatus.ACTIVE);
    });
});

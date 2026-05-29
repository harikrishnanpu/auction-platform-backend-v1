import { describe, expect, it } from 'vitest';
import { Bid } from '@domain/entities/auction/bid.entity';

describe('Bid Domain Entity', () => {
    it('should successfully create a Bid with clear amount', () => {
        const bidResult = Bid.create({
            id: 'bid-123',
            auctionId: 'auction-456',
            userId: 'user-789',
            amount: 150.0,
        });

        expect(bidResult.isSuccess).toBe(true);
        expect(bidResult.isFailure).toBe(false);
        expect(bidResult.getValue().getId()).toBe('bid-123');
        expect(bidResult.getValue().getAuctionId()).toBe('auction-456');
        expect(bidResult.getValue().getUserId()).toBe('user-789');
        expect(bidResult.getValue().getAmount()).toBe(150.0);
        expect(bidResult.getValue().getEncryptedAmount()).toBeNull();
    });

    it('should successfully create a Bid with encrypted amount', () => {
        const bidResult = Bid.create({
            id: 'bid-123',
            auctionId: 'auction-456',
            userId: 'user-789',
            encryptedAmount: 'super-secret-payload',
        });

        expect(bidResult.isSuccess).toBe(true);
        expect(bidResult.getValue().getAmount()).toBe(0);
        expect(bidResult.getValue().getEncryptedAmount()).toBe(
            'super-secret-payload',
        );
    });

    it('should fail to create a Bid when both clear amount and encrypted amount are provided', () => {
        const bidResult = Bid.create({
            id: 'bid-123',
            auctionId: 'auction-456',
            userId: 'user-789',
            amount: 150.0,
            encryptedAmount: 'super-secret-payload',
        });

        expect(bidResult.isSuccess).toBe(false);
        expect(bidResult.isFailure).toBe(true);
        expect(bidResult.getError()).toBe(
            'Amount and encrypted amount cannot be provided together',
        );
    });
});

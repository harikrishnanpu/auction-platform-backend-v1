export const AUCTION_MESSAGES = {
    AUCTION_NOT_ACTIVE: 'Auction is not active',
    AUCTION_NOT_STARTED: 'Auction is not started',
    AUCTION_ENDED: 'Auction has ended',
    SELLER_CANNOT_PLACE_BID: 'Seller cannot place bid',
    BID_BELOW_MIN: (min: number, increment: number) =>
        `Bid must be at least ${min} (min increment ${increment})`,
    COOLDOWN_WAIT: (seconds: number) => `Wait ${seconds}s before next bid`,
};

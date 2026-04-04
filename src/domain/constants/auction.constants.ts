export const AUCTION_MESSAGES = {
    AUCTION_NOT_ACTIVE: 'Auction is not active',
    AUCTION_NOT_STARTED: 'Auction is not started',
    AUCTION_ENDED: 'Auction has ended',
    SELLER_CANNOT_PLACE_BID: 'Seller cannot place bid',
    BID_BELOW_MIN: (min: number, increment: number) =>
        `Bid must be at least ${min} (min increment ${increment})`,
    COOLDOWN_WAIT: (seconds: number) => `Wait ${seconds}s before next bid`,
    BID_BELOW_START_PRICE: (startPrice: number) =>
        `Bid must be at least ${startPrice}`,
    ONLY_ONE_BID_PER_USER: 'Only one bid per user is allowed',
};

export const AUCTION_PAYMENT_AMOUNT_SPLIT_STRATEGY = {
    DEPOSIT_PERCENTAGE: 0.25,
};

export const AUCTION_PAYMENT_DUE_AT_STRATEGY = {
    DEPOSIT_DAYS_MS: 24 * 60 * 60 * 1000,
    BALANCE_MONTHS_MS: 30 * 24 * 60 * 60 * 1000,
};

export const AUCTION_WINNER_FALLBACK_CONSTANTS = {
    MAX_RANK: 1, // --change --
};

export const AUCTION_INTIAL_DEPOSIT_AMOUNT = {
    PERCENTAGE: 0.1,
};

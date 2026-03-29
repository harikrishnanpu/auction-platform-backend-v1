export const AUCTION_MESSAGES = {
    NOT_AUTHORIZED_TO_VIEW_AUCTION: 'Not authorized to view this auction',
    NOT_AUTHORIZED_TO_UPDATE: 'Not authorized to update this auction',
    ONLY_DRAFT_CAN_BE_UPDATED: 'Only draft auctions can be updated',

    NOT_AUTHORIZED_TO_PUBLISH: 'Not authorized to publish this auction',
    ONLY_DRAFT_CAN_BE_PUBLISHED: 'Only draft auctions can be published',
    END_TIME_ALREADY_PASSED:
        'Cannot publish auction: end time has already passed',

    NOT_AUTHORIZED_TO_END: 'Not authorized to end this auction',
    ONLY_ACTIVE_CAN_BE_ENDED: 'Only active auctions can be ended',
    ONLY_ACTIVE_CAN_BE_PAUSED: 'Only active auctions can be paused',
    ONLY_PAUSED_CAN_BE_RESUMED: 'Only paused auctions can be resumed',

    AUCTION_NOT_ACTIVE: 'Auction is not active',
    AUCTION_ENDED: 'Auction is ended',
    AUCTION_NOT_STARTED: 'Auction is not started',

    SELLER_CANNOT_PLACE_BID: 'Seller cannot place bid',
    BID_BELOW_LATEST: 'Bid amount must be greater than the latest bid',
    BID_BELOW_MIN: (min: number, increment: number) => {
        return `Bid must be at least ${min} (min increment ${increment})`;
    },
} as const;

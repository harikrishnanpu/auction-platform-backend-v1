export const AUCTION_MESSAGES = {
  NOT_AUTHORIZED_TO_UPDATE: 'Not authorized to update this auction',
  ONLY_DRAFT_CAN_BE_UPDATED: 'Only draft auctions can be updated',

  NOT_AUTHORIZED_TO_PUBLISH: 'Not authorized to publish this auction',
  ONLY_DRAFT_CAN_BE_PUBLISHED: 'Only draft auctions can be published',
  END_TIME_ALREADY_PASSED:
    'Cannot publish auction: end time has already passed',

  NOT_AUTHORIZED_TO_END: 'Not authorized to end this auction',
  ONLY_ACTIVE_CAN_BE_ENDED: 'Only active auctions can be ended',

  AUCTION_NOT_ACTIVE: 'Auction is not active',
  AUCTION_ENDED: 'Auction is ended',
  AUCTION_NOT_STARTED: 'Auction is not started',

  SELLER_CANNOT_PLACE_BID: 'Seller cannot place bid',
  BID_BELOW_LATEST: 'Bid amount must be greater than the latest bid',
  BID_BELOW_MIN: (min: number, increment: number) =>
    `Bid must be at least ${min} (min increment ${increment})`,
  COOLDOWN_WAIT: (seconds: number) => `Wait ${seconds}s before next bid`,
} as const;

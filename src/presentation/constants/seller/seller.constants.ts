import { STATUS_CODES } from '../http/status.code';

export const SELLER_MESSAGES = {
  GET_ALL_SELLER_AUCTION_CATEGORY_SUCCESSFULLY:
    'All seller auction category fetched successfully',
  GET_ALL_SELLER_AUCTION_CATEGORY_FAILED:
    'Failed to fetch all seller auction category',
  USER_NOT_FOUND: 'User not found',
  ACTION_CATEGORY_REQUESTED_SUCCESSFULLY:
    'Action category requested successfully',
  GET_ALL_SELLER_AUCTIONS_SUCCESSFULLY:
    'All seller auctions fetched successfully',
  GET_ALL_SELLER_AUCTIONS_FAILED: 'Failed to fetch all seller auctions',
};

export const SELLER_CONSTANTS = {
  MESSAGES: SELLER_MESSAGES,
  CODES: STATUS_CODES,
};

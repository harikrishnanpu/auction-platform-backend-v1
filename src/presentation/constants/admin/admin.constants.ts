import { STATUS_CODES } from '../http/status.code';

export const ADMIN_MESSAGES = {
  GET_ALL_USERS_SUCCESSFULLY: 'All users fetched successfully',
  GET_ALL_USERS_FAILED: 'Failed to fetch all users',
  BLOCK_USER_SUCCESSFULLY: 'User blocked successfully',
  BLOCK_USER_FAILED: 'Failed to block user',
  GET_USER_SUCCESSFULLY: 'User fetched successfully',
  GET_USER_FAILED: 'Failed to fetch user',
  GET_ALL_SELLERS_SUCCESSFULLY: 'All sellers fetched successfully',
  GET_ALL_SELLERS_FAILED: 'Failed to fetch all sellers',
  GET_SELLER_SUCCESSFULLY: 'Seller fetched successfully',
  GET_SELLER_FAILED: 'Failed to fetch seller',
  APPROVE_SELLER_KYC_SUCCESSFULLY: 'KYC approved successfully',
  APPROVE_SELLER_KYC_FAILED: 'Failed to approve KYC',
  REJECT_SELLER_KYC_SUCCESSFULLY: 'KYC rejected successfully',
  REJECT_SELLER_KYC_FAILED: 'Failed to reject KYC',
  GET_ALL_CATEGORY_REQUEST_SUCCESSFULLY:
    'All category request fetched successfully',
  GET_ALL_CATEGORY_REQUEST_FAILED: 'Failed to fetch all category request',
  APPROVE_AUCTION_CATEGORY_SUCCESSFULLY:
    'Auction category approved successfully',
  APPROVE_AUCTION_CATEGORY_FAILED: 'Failed to approve auction category',
  CHANGE_AUCTION_CATEGORY_STATUS_SUCCESSFULLY:
    'Auction category status changed successfully',
  CHANGE_AUCTION_CATEGORY_STATUS_FAILED:
    'Failed to change auction category status',
  GET_ALL_AUCTION_CATEGORIES_SUCCESSFULLY:
    'All auction categories fetched successfully',
  GET_ALL_AUCTION_CATEGORIES_FAILED: 'Failed to fetch all auction categories',
  UPDATE_AUCTION_CATEGORY_SUCCESSFULLY: 'Auction category updated successfully',
  UPDATE_AUCTION_CATEGORY_FAILED: 'Failed to update auction category',
  VIEW_KYC_SUCCESSFULLY: 'KYC viewed successfully',
  VIEW_KYC_FAILED: 'Failed to view KYC',
  USER_NOT_FOUND: 'User not found',
  REJECT_AUCTION_CATEGORY_SUCCESSFULLY:
    'Auction category rejected successfully',
  REJECT_AUCTION_CATEGORY_FAILED: 'Failed to reject auction category',
  CREATE_AUCTION_CATEGORY_SUCCESSFULLY: 'Auction category created successfully',
  CREATE_AUCTION_CATEGORY_FAILED: 'Failed to create auction category',
  GET_ALL_ADMIN_AUCTIONS_SUCCESSFULLY: 'All auctions fetched successfully',
  GET_ALL_ADMIN_AUCTIONS_FAILED: 'Failed to fetch all auctions',
};

export const ADMIN_CONSTANTS = {
  MESSAGES: ADMIN_MESSAGES,
  CODES: STATUS_CODES,
};

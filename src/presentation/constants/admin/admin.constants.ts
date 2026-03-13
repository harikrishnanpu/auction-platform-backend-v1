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
};

export const ADMIN_CONSTANTS = {
  MESSAGES: ADMIN_MESSAGES,
  CODES: STATUS_CODES,
};

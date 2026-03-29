import { STATUS_CODES } from '../http/status.code';

export const WALLET_MESSAGES = {
    USER_NOT_FOUND: 'User not found',
    GET_WALLET_SUCCESSFULLY: 'Wallet fetched successfully',
    CREDIT_WALLET_SUCCESSFULLY: 'Wallet credited successfully',
    DEBIT_WALLET_SUCCESSFULLY: 'Wallet debited successfully',
    CREATE_TOPUP_ORDER_SUCCESSFULLY: 'Top-up order created successfully',
    VERIFY_TOPUP_SUCCESSFULLY: 'Wallet top-up verified successfully',
};

export const WALLET_CONSTANTS = {
    MESSAGES: WALLET_MESSAGES,
    CODES: STATUS_CODES,
};

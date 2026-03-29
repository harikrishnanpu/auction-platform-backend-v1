import { STATUS_CODES } from '../http/status.code';

export const PAYMENTS_MESSAGES = {
    USER_NOT_FOUND: 'User not found',
    GET_PAYMENTS_SUCCESSFULLY: 'Payments fetched successfully',
    CREATE_PAYMENT_ORDER_SUCCESSFULLY: 'Payment order created successfully',
    VERIFY_PAYMENT_SUCCESSFULLY: 'Payment verified successfully',
    DECLINE_PAYMENT_SUCCESSFULLY: 'Payment declined successfully',
};

export const PAYMENTS_CONSTANTS = {
    MESSAGES: PAYMENTS_MESSAGES,
    CODES: STATUS_CODES,
};

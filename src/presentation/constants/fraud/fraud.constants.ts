import { STATUS_CODES } from '../http/status.code';

export const FRAUD_MESSAGES = {
    CREATE_REPORT_SUCCESSFULLY: 'Fraud report created successfully',
    GET_REPORTS_SUCCESSFULLY: 'Fraud reports fetched successfully',
    MARK_UNDER_REVIEW_SUCCESSFULLY: 'Fraud report marked under review',
    REVIEW_REPORT_SUCCESSFULLY: 'Fraud report reviewed successfully',
    GET_SUSPENDED_USERS_SUCCESSFULLY: 'Suspended users fetched successfully',
    GET_SUSPENSION_TIMELINE_SUCCESSFULLY:
        'Suspension timeline fetched successfully',
    USER_NOT_FOUND: 'User not found',
};

export const FRAUD_CONSTANTS = {
    MESSAGES: FRAUD_MESSAGES,
    CODES: STATUS_CODES,
};

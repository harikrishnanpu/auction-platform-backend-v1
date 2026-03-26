import { STATUS_CODES } from '../http/status.code';

export const USER_PROFILE_MESSAGES = {
    CHANGE_PROFILE_PASSWORD_SUCCESSFULLY:
        'Profile password changed successfully',
    USER_NOT_FOUND: 'User not found',
    PROFILE_CHANGE_PASSWORD_EMAIL_SENT_SUCCESSFULLY:
        'Profile change password email sent successfully',
    EDIT_PROFILE_SEND_OTP_SUCCESSFULLY: 'Edit profile send otp successfully',
    EDIT_PROFILE_SUCCESSFULLY: 'Edit profile successfully',
    GENERATE_AVATAR_UPLOAD_URL_SUCCESSFULLY:
        'Generate avatar upload url successfully',
    UPDATE_AVATAR_URL_SUCCESSFULLY: 'Update avatar url successfully',
    GET_NOTIFICATIONS_SUCCESSFULLY: 'Get notifications successfully',
    GET_MY_AUCTIONS_SUCCESSFULLY: 'Get my auctions successfully',
};

export const USER_PROFILE_CONSTANTS = {
    MESSAGES: USER_PROFILE_MESSAGES,
    CODES: STATUS_CODES,
};

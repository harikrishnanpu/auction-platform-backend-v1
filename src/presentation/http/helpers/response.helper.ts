import { STATUS_CODES } from '@presentation/constants/http/status.code';
import { ApiResponse } from '@presentation/types/api.types';

type API_RESPONSE_CODES = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];

export class ResponseHelper {
  static success<T>(
    data: T,
    message: string,
    code: API_RESPONSE_CODES = STATUS_CODES.OK,
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      status: code,
      error: null,
    };
  }

  static error(
    message: string,
    code: API_RESPONSE_CODES = STATUS_CODES.INTERNAL_SERVER_ERROR,
  ): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message,
      status: code,
      error: message,
    };
  }
}

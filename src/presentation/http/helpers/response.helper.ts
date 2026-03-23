import { STATUS_CODES } from '@presentation/constants/http/status.code';
import { ApiResponse } from '@presentation/types/api.types';
import { Response } from 'express';

type API_RESPONSE_CODES = (typeof STATUS_CODES)[keyof typeof STATUS_CODES];

export class ResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message: string,
    code: API_RESPONSE_CODES = STATUS_CODES.OK,
  ): Response<ApiResponse<T>> {
    return res.status(code).json({
      success: true,
      data,
      message,
      status: code,
      error: null,
    });
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

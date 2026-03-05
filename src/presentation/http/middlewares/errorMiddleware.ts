import { NextFunction, Request, Response } from 'express';
import { AppError } from '../error/app.error';
import { STATUS_CODES } from '@presentation/constants/http/status.code';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.statusCode,
      message: err.message,
    });
  }

  return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    status: STATUS_CODES.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error',
  });
};

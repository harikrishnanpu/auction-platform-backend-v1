import { NextFunction, Request, Response } from 'express';
import { AppError } from '../error/app.error';
import { STATUS_CODES } from '@presentation/constants/http/status.code';
import { ResponseHelper } from '../helpers/response.helper';

export const errorMiddleware = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.statusCode,
      message: err.message,
    });
  }

  console.log(err);

  const response = ResponseHelper.error(
    'Internal Server Error',
    STATUS_CODES.INTERNAL_SERVER_ERROR,
  );
  return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json(response);
};

import { ZodSchema } from 'zod';
import { AppError } from '../error/app.error';
import { STATUS_CODES } from '@presentation/constants/http/status.code';

export class ValidationHelper {
  static validate<T>(schema: ZodSchema, data: T): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new AppError(
        result.error.issues[0].message,
        STATUS_CODES.BAD_REQUEST,
      );
    }

    return result.data as T;
  }
}

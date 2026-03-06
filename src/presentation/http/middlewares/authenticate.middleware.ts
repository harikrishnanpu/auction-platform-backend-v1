import { STATUS_CODES } from '@presentation/constants/http/status.code';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { AppError } from '../error/app.error';
import { TokenGenerator } from '@infrastructure/services/token/tokenGenerator.service';

export const authenticateMiddleware = expressAsyncHandler(
  async (
    req: Request & { user?: string },
    res: Response,
    next: NextFunction,
  ) => {
    console.log('authenticateMiddleware called');
    console.log(req.cookies);
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError('Unauthorized', STATUS_CODES.UNAUTHORIZED);
    }

    const payload = new TokenGenerator().verifyAccesstoken(token);
    req.user = payload;
    next();
  },
);

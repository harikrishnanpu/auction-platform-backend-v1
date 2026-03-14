import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { AppError } from '../error/app.error';
import { STATUS_CODES } from '@presentation/constants/http/status.code';
import { AUTH_MESSAGES } from '@presentation/constants/auth/auth.constants';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';

export class AuthorizeMiddleware {
  authorize = (userRoles: UserRoleType[]) =>
    expressAsyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
          throw new AppError(
            AUTH_MESSAGES.UNAUTHORIZED,
            STATUS_CODES.UNAUTHORIZED,
          );
        }

        let isAuthorized = true;
        for (const userRole of userRoles) {
          if (!user.roles.includes(userRole)) {
            isAuthorized = false;
            break;
          }
        }

        if (!isAuthorized) {
          throw new AppError(
            AUTH_MESSAGES.UNAUTHORIZED,
            STATUS_CODES.UNAUTHORIZED,
          );
        }

        next();
      },
    );
}

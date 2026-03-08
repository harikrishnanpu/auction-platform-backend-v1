import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { AppError } from '../error/app.error';
import { STATUS_CODES } from '@presentation/constants/http/status.code';
import { UserRole } from '@domain/value-objects/user-roles.vo';
import { AUTH_MESSAGES } from '@presentation/constants/auth/auth.constants';
import { User } from '@domain/entities/user/user.entity';

export class AuthorizeMiddleware {
  authorize = (userRoles: UserRole[]) =>
    expressAsyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as User;

        let isAuthorized = true;
        for (const userRole of userRoles) {
          if (!user.hasRole(userRole)) {
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

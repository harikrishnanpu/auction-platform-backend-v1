import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { AppError } from '../error/app.error';
import { AUTH_MESSAGES } from '@presentation/constants/auth/auth.constants';
import { STATUS_CODES } from '@presentation/constants/http/status.code';
import { UserRole } from '@domain/value-objects/user-roles.vo';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';

@injectable()
export class AuthenticateMiddleware {
  constructor(
    @inject(TYPES.IUserRepository)
    private _userRepository: IUserRepository,
    @inject(TYPES.ITokenGeneratorService)
    private _tokenGenerator: ITokenGeneratorService,
  ) {}

  authenticate = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.cookies.accessToken;
      const decoded = this._tokenGenerator.verifyAccesstoken(token);

      if (!decoded) {
        throw new AppError(
          AUTH_MESSAGES.UNAUTHORIZED,
          STATUS_CODES.UNAUTHORIZED,
        );
      }

      const userEntity = await this._userRepository.findById(decoded);

      if (userEntity.isFailure) {
        throw new AppError(
          AUTH_MESSAGES.USER_NOT_FOUND,
          STATUS_CODES.NOT_FOUND,
        );
      }

      if (!userEntity.getValue().hasRole(UserRole.USER)) {
        throw new AppError(
          AUTH_MESSAGES.UNAUTHORIZED,
          STATUS_CODES.UNAUTHORIZED,
        );
      }

      req.user = userEntity.getValue();

      next();
    },
  );
}

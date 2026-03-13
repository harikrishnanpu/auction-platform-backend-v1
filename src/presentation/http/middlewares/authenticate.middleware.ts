import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { AppError } from '../error/app.error';
import { AUTH_MESSAGES } from '@presentation/constants/auth/auth.constants';
import { STATUS_CODES } from '@presentation/constants/http/status.code';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';
import { AuthUser } from '@presentation/types/auth.user';
import { IGetUserUsecase } from '@application/interfaces/usecases/auth/IGetUserUsecase';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';

@injectable()
export class AuthenticateMiddleware {
  constructor(
    @inject(TYPES.IGetUserUsecase)
    private _getUserUseCase: IGetUserUsecase,
    @inject(TYPES.ITokenGeneratorService)
    private _tokenGenerator: ITokenGeneratorService,
  ) {}

  authenticate = expressAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.cookies?.accessToken;

      console.log('token TEST --', token);

      if (!token) {
        throw new AppError(
          AUTH_MESSAGES.UNAUTHORIZED,
          STATUS_CODES.UNAUTHORIZED,
        );
      }

      const decoded = this._tokenGenerator.verifyAccesstoken(token);

      if (!decoded) {
        console.log('FAILED TOKEN VERIFI!--', decoded);
        throw new AppError(
          AUTH_MESSAGES.UNAUTHORIZED,
          STATUS_CODES.UNAUTHORIZED,
        );
      }

      const userEntity = await this._getUserUseCase.execute(decoded);

      console.log('userEntity TEST --', userEntity);

      if (userEntity.isFailure) {
        throw new AppError(
          AUTH_MESSAGES.USER_NOT_FOUND,
          STATUS_CODES.NOT_FOUND,
        );
      }

      if (!userEntity.getValue().roles.includes(UserRoleType.USER)) {
        throw new AppError(
          AUTH_MESSAGES.UNAUTHORIZED,
          STATUS_CODES.UNAUTHORIZED,
        );
      }

      const authUser: AuthUser = {
        id: userEntity.getValue().id,
        name: userEntity.getValue().name,
        email: userEntity.getValue().email,
        phone: userEntity.getValue().phone,
        address: userEntity.getValue().address,
        avatar_url: userEntity.getValue().avatar_url,
        isProfileCompleted: userEntity.getValue().isProfileCompleted,
        isVerified: userEntity.getValue().isVerified,
        status: userEntity.getValue().status,
        authProvider: userEntity.getValue().authProvider,
        roles: userEntity.getValue().roles,
      };

      req.user = authUser;

      next();
    },
  );
}

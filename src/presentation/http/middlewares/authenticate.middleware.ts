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
import { UserStatus } from '@domain/entities/user/user.entity';

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

      const userDto = userEntity.getValue();
      if (userDto.status === UserStatus.BLOCKED) {
        throw new AppError('ACCOUNT_BLOCKED', STATUS_CODES.FORBIDDEN);
      }

      if (!userDto.roles.includes(UserRoleType.USER)) {
        throw new AppError(
          AUTH_MESSAGES.UNAUTHORIZED,
          STATUS_CODES.UNAUTHORIZED,
        );
      }

      const authUser: AuthUser = {
        id: userDto.id,
        name: userDto.name,
        email: userDto.email,
        phone: userDto.phone,
        address: userDto.address,
        avatar_url: userDto.avatar_url,
        isProfileCompleted: userDto.isProfileCompleted,
        isVerified: userDto.isVerified,
        status: userDto.status,
        authProvider: userDto.authProvider,
        roles: userDto.roles,
      };

      req.user = authUser;

      next();
    },
  );
}

import { ITokenGeneratorService } from '@application/interfaces/services/ITokenGeneratorService';
import { IGetUserUsecase } from '@application/interfaces/usecases/auth/IGetUserUsecase';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { UserStatus } from '@domain/entities/user/user.entity';
import { TYPES } from '@di/types.di';
import { AuthUser } from '@presentation/types/auth.user';
import { parse } from 'cookie';
import type { Container } from 'inversify';
import type { Socket } from 'socket.io';

export function createSocketAuthMiddleware(container: Container) {
  return async (socket: Socket, next: (err?: Error) => void) => {
    const tokenGenerator = container.get<ITokenGeneratorService>(
      TYPES.ITokenGeneratorService,
    );

    const getUserUseCase = container.get<IGetUserUsecase>(
      TYPES.IGetUserUsecase,
    );

    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) {
      return next(new Error('Unauthorized'));
    }

    const cookies = parse(rawCookie);
    const token = cookies.accessToken;
    if (!token) {
      console.log('SOCKET ERROR!');
      return next(new Error('Unauthorized'));
    }

    let userId: string;
    try {
      userId = tokenGenerator.verifyAccesstoken(token);
    } catch {
      return next(new Error('Unauthorized'));
    }

    if (!userId) {
      return next(new Error('Unauthorized'));
    }

    const userEntity = await getUserUseCase.execute(userId);
    if (userEntity.isFailure) {
      return next(new Error('Unauthorized'));
    }

    const userDto = userEntity.getValue();
    if (userDto.status === UserStatus.BLOCKED) {
      return next(new Error('Unauthorized'));
    }

    if (!userDto.roles.includes(UserRoleType.USER)) {
      return next(new Error('Unauthorized'));
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

    socket.data.user = authUser;
    next();
  };
}

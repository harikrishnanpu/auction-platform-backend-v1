import {
  IGetAllUsersInput,
  IGetAllUsersOutput,
} from '@application/dtos/admin/getAllusers.dto';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { IGetAllUsersUsecase } from '@application/interfaces/usecases/admin/IGetAllUsersUsecase';
import { TYPES } from '@di/types.di';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { IFindAllUsersInput } from '@domain/types/userRepo.types';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAllUsersUseCase implements IGetAllUsersUsecase {
  constructor(
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}

  async execute(data: IGetAllUsersInput): Promise<Result<IGetAllUsersOutput>> {
    try {
      const { page, limit, search, sort, order, role, status, authProvider } =
        data;

      const input: IFindAllUsersInput = {
        page,
        limit,
        search,
        sort,
        order,
        role,
        status,
        authProvider,
      };

      const usersResult = await this._userRepository.findAll(input);

      if (usersResult.isFailure) {
        console.log(usersResult.getError());
        return Result.fail(usersResult.getError());
      }

      const allUsers = usersResult.getValue().map((user) => {
        // console.log(user);
        return {
          id: user.getId(),
          name: user.getName(),
          email: user.getEmail().getValue(),
          phone: user.getPhone()?.getValue() ?? '',
          address: user.getAddress() ?? '',
          avatar_url: user.getAvatarUrl() ?? '',
          isProfileCompleted: user.isProfileCompleted(),
          isVerified: user.getIsVerified(),
          status: user.getStatus(),
          authProvider: user.getAuthProvider().getType(),
          roles: user.getRoles().map((role) => role.getValue() as UserRoleType),
        };
      });

      return Result.ok({
        users: allUsers,
        total: usersResult.getValue().length,
        page,
        limit,
        totalPages: Math.ceil(allUsers.length / limit),
        currentPage: page,
      });
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM GET ALL USERS USECASE');
    }
  }
}

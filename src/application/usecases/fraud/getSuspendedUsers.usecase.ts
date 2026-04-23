import {
    IGetSuspendedUsersInputDto,
    IGetSuspendedUsersOutputDto,
} from '@application/dtos/fraud/fraud-report.dto';
import { IGetSuspendedUsersUsecase } from '@application/interfaces/usecases/fraud/IGetSuspendedUsersUsecase';
import { TYPES } from '@di/types.di';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetSuspendedUsersUsecase implements IGetSuspendedUsersUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
    ) {}

    async execute(
        input: IGetSuspendedUsersInputDto,
    ): Promise<Result<IGetSuspendedUsersOutputDto>> {
        const result = await this._userRepository.findSuspendedUsers({
            page: input.page,
            limit: input.limit,
            search: input.search,
        });
        if (result.isFailure) return Result.fail(result.getError());
        const value = result.getValue();
        return Result.ok({
            users: value.users,
            total: value.total,
            page: input.page,
            limit: input.limit,
            totalPages: Math.max(1, Math.ceil(value.total / input.limit)),
        });
    }
}

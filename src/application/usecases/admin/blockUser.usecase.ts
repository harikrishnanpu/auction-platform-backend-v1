import {
    IBlockUserInput,
    IBlockUserOutput,
} from '@application/dtos/admin/blockuser.dto';
import { IBlockUserUsecase } from '@application/interfaces/usecases/admin/IBlockUserUsecase';

import { AdminMapperProfile } from '@application/mappers/admin/admin.mapper';
import { TYPES } from '@di/types.di';
import { UserStatus } from '@domain/entities/user/user.entity';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class BlockUserUseCase implements IBlockUserUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
    ) {}

    async execute(data: IBlockUserInput): Promise<Result<IBlockUserOutput>> {
        const dto = AdminMapperProfile.toBlockUserInputDto(data);
        const { userId, block } = dto;

        const userEntity = await this._userRepository.findById(userId);

        if (userEntity.isFailure) {
            return Result.fail(userEntity.getError());
        }

        const user = userEntity.getValue();
        user.setStatus(block ? UserStatus.BLOCKED : UserStatus.ACTIVE);
        await this._userRepository.save(user);

        return Result.ok({ status: user.getStatus() });
    }
}

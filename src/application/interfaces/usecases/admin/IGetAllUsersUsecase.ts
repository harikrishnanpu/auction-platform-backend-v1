import { IGetAllUsersOutput } from '@application/dtos/admin/getAllusers.dto';
import { Result } from '@domain/shared/result';
import { ZodGetAllUsersInputType } from '@presentation/validators/schemas/admin/getAllUsers.schema';

export interface IGetAllUsersUsecase {
    execute(data: ZodGetAllUsersInputType): Promise<Result<IGetAllUsersOutput>>;
}

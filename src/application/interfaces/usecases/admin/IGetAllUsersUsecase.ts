import { IGetAllUsersOutput } from '@application/dtos/admin/getAllusers.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedGetAllUsersInput {
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
    order?: string;
    role?: string;
    status?: string;
    authProvider?: string;
}

export interface IGetAllUsersUsecase {
    execute(
        data: IValidatedGetAllUsersInput,
    ): Promise<Result<IGetAllUsersOutput>>;
}

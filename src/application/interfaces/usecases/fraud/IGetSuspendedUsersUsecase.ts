import {
    IGetSuspendedUsersInputDto,
    IGetSuspendedUsersOutputDto,
} from '@application/dtos/fraud/fraud-report.dto';
import { Result } from '@domain/shared/result';

export interface IGetSuspendedUsersUsecase {
    execute(
        input: IGetSuspendedUsersInputDto,
    ): Promise<Result<IGetSuspendedUsersOutputDto>>;
}

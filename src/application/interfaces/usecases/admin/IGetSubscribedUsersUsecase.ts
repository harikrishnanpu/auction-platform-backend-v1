import { IGetSubscribedUsersOutputDto } from '@application/dtos/admin/subscription.dto';
import { Result } from '@domain/shared/result';

export interface IGetSubscribedUsersUsecase {
    execute(): Promise<Result<IGetSubscribedUsersOutputDto>>;
}

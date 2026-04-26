import { ISuspensionUserItemDto } from '@application/dtos/fraud/fraud-report.dto';
import { Result } from '@domain/shared/result';

export interface IGetSuspensionUsersUsecase {
    execute(userId: string): Promise<Result<ISuspensionUserItemDto[]>>;
}

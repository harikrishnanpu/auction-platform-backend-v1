import { IGetSystemConfigsOutputDto } from '@application/dtos/admin/systemConfig.dto';
import { Result } from '@domain/shared/result';

export interface IGetSystemConfigsUsecase {
    execute(): Promise<Result<IGetSystemConfigsOutputDto>>;
}

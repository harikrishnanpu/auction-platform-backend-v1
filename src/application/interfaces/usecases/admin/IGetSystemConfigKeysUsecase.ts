import { IGetSystemConfigKeysOutputDto } from '@application/dtos/admin/systemConfig.dto';
import { Result } from '@domain/shared/result';

export interface IGetSystemConfigKeysUsecase {
    execute(): Promise<Result<IGetSystemConfigKeysOutputDto>>;
}

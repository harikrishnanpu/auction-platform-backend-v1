import { IGetSystemConfigKeysOutputDto } from '@application/dtos/admin/systemConfig.dto';
import { IGetSystemConfigKeysUsecase } from '@application/interfaces/usecases/admin/IGetSystemConfigKeysUsecase';
import { SystemConfigKey } from '@domain/constants/systemConfig.constants';
import { Result } from '@domain/shared/result';
import { injectable } from 'inversify';

@injectable()
export class GetSystemConfigKeysUsecase implements IGetSystemConfigKeysUsecase {
    async execute(): Promise<Result<IGetSystemConfigKeysOutputDto>> {
        return Result.ok({
            keys: Object.values(SystemConfigKey),
        });
    }
}

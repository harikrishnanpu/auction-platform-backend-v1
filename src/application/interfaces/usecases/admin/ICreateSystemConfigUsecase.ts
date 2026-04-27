import { ISystemConfigDto } from '@application/dtos/admin/systemConfig.dto';
import { Result } from '@domain/shared/result';
import { ZodCreateSystemConfigInputType } from '@presentation/validators/schemas/admin/createSystemConfig.schema';

export interface ICreateSystemConfigUsecase {
    execute(
        input: ZodCreateSystemConfigInputType,
    ): Promise<Result<ISystemConfigDto>>;
}

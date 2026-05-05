import { ISystemConfigDto } from '@application/dtos/admin/systemConfig.dto';
import { Result } from '@domain/shared/result';
import { ZodEditSystemConfigInputType } from '@presentation/validators/schemas/admin/editSystemConfig.schema';

export interface IEditSystemConfigUsecase {
    execute(
        input: ZodEditSystemConfigInputType,
    ): Promise<Result<ISystemConfigDto>>;
}

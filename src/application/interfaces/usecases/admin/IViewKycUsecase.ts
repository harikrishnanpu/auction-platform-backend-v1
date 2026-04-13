import { IViewKycOutputDto } from '@application/dtos/admin/viewKyc.dto';
import { Result } from '@domain/shared/result';
import { ZodViewKycInputType } from '@presentation/validators/schemas/admin/viewKyc.schema';

export interface IViewKycUsecase {
    execute(data: ZodViewKycInputType): Promise<Result<IViewKycOutputDto>>;
    // stream
}

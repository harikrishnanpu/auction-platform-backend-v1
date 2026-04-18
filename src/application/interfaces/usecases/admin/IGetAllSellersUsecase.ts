import { IGetAllSellersOutput } from '@application/dtos/admin/getSellers.dto';
import { Result } from '@domain/shared/result';
import { ZodGetAllSellersInputType } from '@presentation/validators/schemas/admin/getSellers.schema';

export interface IGetAllSellersUsecase {
    execute(
        data: ZodGetAllSellersInputType,
    ): Promise<Result<IGetAllSellersOutput>>;
}

import { IGetAllSellersOutput } from '@application/dtos/admin/getSellers.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedGetAllSellersInput {
    page?: string;
    limit?: string;
    pendingOnly?: boolean;
}

export interface IGetAllSellersUsecase {
    execute(
        data: IValidatedGetAllSellersInput,
    ): Promise<Result<IGetAllSellersOutput>>;
}

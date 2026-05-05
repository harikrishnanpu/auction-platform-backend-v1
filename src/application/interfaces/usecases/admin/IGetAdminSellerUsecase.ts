import { IGetAdminSellerOutput } from '@application/dtos/admin/getAdminSeller.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedGetAdminSellerInput {
    id: string;
}

export interface IGetAdminSellerUsecase {
    execute(
        data: IValidatedGetAdminSellerInput,
    ): Promise<Result<IGetAdminSellerOutput>>;
}

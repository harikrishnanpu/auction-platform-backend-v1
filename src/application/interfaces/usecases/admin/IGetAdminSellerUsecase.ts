import { IGetAdminSellerOutput } from '@application/dtos/admin/getAdminSeller.dto';
import { Result } from '@domain/shared/result';
import { ZodGetAdminSellerInputType } from '@presentation/validators/schemas/admin/getAdminSeller.schema';

export interface IGetAdminSellerUsecase {
    execute(
        data: ZodGetAdminSellerInputType,
    ): Promise<Result<IGetAdminSellerOutput>>;
}

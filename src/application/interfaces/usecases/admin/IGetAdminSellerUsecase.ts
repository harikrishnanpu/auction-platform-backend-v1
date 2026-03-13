import {
  IGetAdminSellerInput,
  IGetAdminSellerOutput,
} from '@application/dtos/admin/getAdminSeller.dto';
import { Result } from '@domain/shared/result';

export interface IGetAdminSellerUsecase {
  execute(data: IGetAdminSellerInput): Promise<Result<IGetAdminSellerOutput>>;
}

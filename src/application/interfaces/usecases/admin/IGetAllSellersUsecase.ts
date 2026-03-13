import {
  IGetAllSellersInput,
  IGetAllSellersOutput,
} from '@application/dtos/admin/getSellers.dto';
import { Result } from '@domain/shared/result';

export interface IGetAllSellersUsecase {
  execute(data: IGetAllSellersInput): Promise<Result<IGetAllSellersOutput>>;
}

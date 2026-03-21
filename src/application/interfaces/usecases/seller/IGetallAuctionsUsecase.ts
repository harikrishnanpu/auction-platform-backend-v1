import {
  IGetAllAuctionsInputDto,
  IGetAllAuctionsOutputDto,
} from '@application/dtos/auction/getAllAuction.dto';
import { Result } from '@domain/shared/result';

export interface IGetAllSellerAuctionsUsecase {
  execute(
    input: IGetAllAuctionsInputDto,
  ): Promise<Result<IGetAllAuctionsOutputDto>>;
}

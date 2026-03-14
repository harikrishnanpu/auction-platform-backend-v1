import {
  IGetSellerAuctionsInput,
  IGetSellerAuctionsOutput,
} from '@application/dtos/auction/get-seller-auctions.dto';
import { Result } from '@domain/shared/result';

export interface IGetSellerAuctionsUsecase {
  execute(
    input: IGetSellerAuctionsInput,
  ): Promise<Result<IGetSellerAuctionsOutput>>;
}

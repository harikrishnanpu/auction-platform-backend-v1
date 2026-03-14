import {
  IEndAuctionInput,
  IEndAuctionOutput,
} from '@application/dtos/auction/end-auction.dto';
import { Result } from '@domain/shared/result';

export interface IEndAuctionUsecase {
  execute(input: IEndAuctionInput): Promise<Result<IEndAuctionOutput>>;
}

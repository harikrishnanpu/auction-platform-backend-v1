import {
  IUpdateAuctionInput,
  IUpdateAuctionOutput,
} from '@application/dtos/auction/update-auction.dto';
import { Result } from '@domain/shared/result';

export interface IUpdateAuctionUsecase {
  execute(input: IUpdateAuctionInput): Promise<Result<IUpdateAuctionOutput>>;
}

import {
  ICreateAuctionInput,
  ICreateAuctionOutput,
} from '@application/dtos/auction/create-auction.dto';
import { Result } from '@domain/shared/result';

export interface ICreateAuctionUsecase {
  execute(input: ICreateAuctionInput): Promise<Result<ICreateAuctionOutput>>;
}

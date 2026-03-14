import {
  IGetAuctionByIdInput,
  IGetAuctionByIdOutput,
} from '@application/dtos/auction/get-auction-by-id.dto';
import { Result } from '@domain/shared/result';

export interface IGetAuctionByIdUsecase {
  execute(input: IGetAuctionByIdInput): Promise<Result<IGetAuctionByIdOutput>>;
}

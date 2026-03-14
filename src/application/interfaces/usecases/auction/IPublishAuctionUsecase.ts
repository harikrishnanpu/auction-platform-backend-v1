import {
  IPublishAuctionInput,
  IPublishAuctionOutput,
} from '@application/dtos/auction/publish-auction.dto';
import { Result } from '@domain/shared/result';

export interface IPublishAuctionUsecase {
  execute(input: IPublishAuctionInput): Promise<Result<IPublishAuctionOutput>>;
}

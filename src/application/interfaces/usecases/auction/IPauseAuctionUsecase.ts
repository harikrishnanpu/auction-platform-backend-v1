import type {
  IPauseAuctionInput,
  IPauseAuctionOutput,
} from '@application/dtos/auction/pause-auction.dto';
import type { Result } from '@domain/shared/result';

export interface IPauseAuctionUsecase {
  execute(input: IPauseAuctionInput): Promise<Result<IPauseAuctionOutput>>;
}

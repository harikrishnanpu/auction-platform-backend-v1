import type {
  IResumeAuctionInput,
  IResumeAuctionOutput,
} from '@application/dtos/auction/resume-auction.dto';
import type { Result } from '@domain/shared/result';

export interface IResumeAuctionUsecase {
  execute(input: IResumeAuctionInput): Promise<Result<IResumeAuctionOutput>>;
}

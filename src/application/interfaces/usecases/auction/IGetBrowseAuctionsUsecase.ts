import {
  IGetBrowseAuctionsInput,
  IGetBrowseAuctionsOutput,
} from '@application/dtos/auction/get-browse-auctions.dto';
import { Result } from '@domain/shared/result';

export interface IGetBrowseAuctionsUsecase {
  execute(
    input: IGetBrowseAuctionsInput,
  ): Promise<Result<IGetBrowseAuctionsOutput>>;
}

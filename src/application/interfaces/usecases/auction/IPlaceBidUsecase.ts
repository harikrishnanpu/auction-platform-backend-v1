import {
  IPlaceBidInput,
  IPlaceBidOutput,
} from '@application/dtos/auction/place-bid.dto';
import { Result } from '@domain/shared/result';

export interface IPlaceBidUsecase {
  execute(input: IPlaceBidInput): Promise<Result<IPlaceBidOutput>>;
}

import { IPlaceBidInput } from '@application/dtos/auction/place-bid.dto';
import { Result } from '@domain/shared/result';

export interface IPlaceBidStrategy {
  validate(data: IPlaceBidInput): Result<IPlaceBidInput>;
}

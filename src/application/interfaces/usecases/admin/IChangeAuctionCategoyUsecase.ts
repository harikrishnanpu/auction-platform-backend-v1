import {
  IChangeAuctionCategoryStatusInputDto,
  IChangeAuctionCategoryStatusOutputDto,
} from '@application/dtos/admin/changeAuctionCategoryStatus.dto';
import { Result } from '@domain/shared/result';

export interface IChangeAuctionCategoryStatusUsecase {
  execute(
    data: IChangeAuctionCategoryStatusInputDto,
  ): Promise<Result<IChangeAuctionCategoryStatusOutputDto>>;
}

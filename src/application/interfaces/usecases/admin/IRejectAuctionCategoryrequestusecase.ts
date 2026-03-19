import {
  IRejectAuctionCategoryrequestInputDto,
  IRejectAuctionCategoryrequestOutputDto,
} from '@application/dtos/admin/rejectAuctionCategory.dto';
import { Result } from '@domain/shared/result';

export interface IRejectAuctionCategoryrequestUsecase {
  execute(
    data: IRejectAuctionCategoryrequestInputDto,
  ): Promise<Result<IRejectAuctionCategoryrequestOutputDto>>;
}

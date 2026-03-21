import {
  IAuctionRoomResultDto,
  IGetAuctionRoomInputDto,
} from '@application/dtos/auction/getAuctionRoom.dto';
import { Result } from '@domain/shared/result';

export interface IGetAuctionRoomUsecase {
  execute(
    input: IGetAuctionRoomInputDto,
  ): Promise<Result<IAuctionRoomResultDto>>;
}

import {
  IGetAuctionRoomInput,
  IGetAuctionRoomOutput,
} from '@application/dtos/auction/get-auction-room.dto';
import { Result } from '@domain/shared/result';

export interface IGetAuctionRoomUsecase {
  execute(input: IGetAuctionRoomInput): Promise<Result<IGetAuctionRoomOutput>>;
}

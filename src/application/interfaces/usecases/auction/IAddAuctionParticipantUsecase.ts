import {
    IAddAuctionParticipantInput,
    IAddAuctionParticipantOutput,
} from '@application/dtos/auction/addAuctionParticipant.dto';
import { Result } from '@domain/shared/result';

export interface IAddAuctionParticipantUsecase {
    execute(
        input: IAddAuctionParticipantInput,
    ): Promise<Result<IAddAuctionParticipantOutput>>;
}

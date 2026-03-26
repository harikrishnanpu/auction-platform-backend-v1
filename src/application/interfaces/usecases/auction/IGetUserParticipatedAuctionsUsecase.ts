import {
    IGetUserParticipatedAuctionsInputDto,
    IGetUserParticipatedAuctionsOutputDto,
} from '@application/dtos/auction/get-user-participated-auctions.dto';
import { Result } from '@domain/shared/result';

export interface IGetUserParticipatedAuctionsUsecase {
    execute(
        input: IGetUserParticipatedAuctionsInputDto,
    ): Promise<Result<IGetUserParticipatedAuctionsOutputDto>>;
}

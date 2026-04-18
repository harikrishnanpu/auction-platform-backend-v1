import { IGetUserParticipatedAuctionsOutputDto } from '@application/dtos/auction/get-user-participated-auctions.dto';
import { Result } from '@domain/shared/result';
import { ZodGetUserParticipatedAuctionsInputType } from '@presentation/validators/schemas/auction/getUserParticipatedAuctionsInput.schema';

export interface IGetUserParticipatedAuctionsUsecase {
    execute(
        input: ZodGetUserParticipatedAuctionsInputType,
    ): Promise<Result<IGetUserParticipatedAuctionsOutputDto>>;
}

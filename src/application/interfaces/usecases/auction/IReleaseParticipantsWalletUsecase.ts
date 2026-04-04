import { IReleaseParticipantsWalletInputDto } from '@application/dtos/auction/releaseParticipantsWallet.dto';
import { Result } from '@domain/shared/result';

export interface IReleaseParticipantsWalletUsecase {
    execute(input: IReleaseParticipantsWalletInputDto): Promise<Result<void>>;
}

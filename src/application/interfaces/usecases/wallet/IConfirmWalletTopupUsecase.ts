import { IConfirmWalletTopupInputDto } from '@application/dtos/wallet/confirmWalletTopup.dto';
import { IWalletOutputDto } from '@application/dtos/wallet/wallet.dto';
import { Result } from '@domain/shared/result';

export interface IConfirmWalletTopupUsecase {
    execute(
        input: IConfirmWalletTopupInputDto,
    ): Promise<Result<IWalletOutputDto>>;
}

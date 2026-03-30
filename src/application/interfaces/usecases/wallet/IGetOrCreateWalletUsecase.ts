import {
    IGetOrCreateWalletInputDto,
    IWalletOutputDto,
} from '@application/dtos/wallet/wallet.dto';
import { Result } from '@domain/shared/result';

export interface IGetOrCreateWalletUsecase {
    execute(
        input: IGetOrCreateWalletInputDto,
    ): Promise<Result<IWalletOutputDto>>;
}

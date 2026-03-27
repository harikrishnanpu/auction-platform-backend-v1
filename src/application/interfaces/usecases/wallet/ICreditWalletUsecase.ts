import { ICreditWalletInputDto } from '@application/dtos/wallet/creditWallet.dto';
import { IWalletOutputDto } from '@application/dtos/wallet/wallet.dto';
import { Result } from '@domain/shared/result';

export interface ICreditWalletUsecase {
    execute(input: ICreditWalletInputDto): Promise<Result<IWalletOutputDto>>;
}

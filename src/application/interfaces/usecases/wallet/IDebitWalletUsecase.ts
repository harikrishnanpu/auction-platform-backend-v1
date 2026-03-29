import { IDebitWalletInputDto } from '@application/dtos/wallet/debitWallet.dto';
import { IWalletOutputDto } from '@application/dtos/wallet/wallet.dto';
import { Result } from '@domain/shared/result';

export interface IDebitWalletUsecase {
    execute(input: IDebitWalletInputDto): Promise<Result<IWalletOutputDto>>;
}

import { ICreditWalletUsecase } from '@application/interfaces/usecases/wallet/ICreditWalletUsecase';
import { IGetOrCreateWalletUsecase } from '@application/interfaces/usecases/wallet/IGetOrCreateWalletUsecase';
import { CreditWalletUsecase } from '@application/usecases/wallet/creditWallet.usecase';
import { GetOrCreateWalletUsecase } from '@application/usecases/wallet/getOrCreateWallet.usecase';
import { TYPES } from '@di/types.di';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { IWalletTransactionsRepository } from '@domain/repositories/IWallettransactionsRepo';
import { PrismaWalletRepository } from '@infrastructure/repositories/wallet/wallet.repo';
import { PrismaWalletTransactionsRepository } from '@infrastructure/repositories/wallet/wallet.transactions.repo';
import { ContainerModule } from 'inversify';

export const walletContainer = new ContainerModule(({ bind }) => {
    bind<IWalletRepository>(TYPES.IWalletRepository).to(PrismaWalletRepository);
    bind<IWalletTransactionsRepository>(TYPES.IWalletTransactionsRepository).to(
        PrismaWalletTransactionsRepository,
    );
    bind<IGetOrCreateWalletUsecase>(TYPES.IGetOrCreateWalletUsecase).to(
        GetOrCreateWalletUsecase,
    );
    bind<ICreditWalletUsecase>(TYPES.ICreditWalletUsecase).to(
        CreditWalletUsecase,
    );
});

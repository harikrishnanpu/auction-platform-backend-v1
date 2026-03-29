import { ICreditWalletUsecase } from '@application/interfaces/usecases/wallet/ICreditWalletUsecase';
import { ICreateWalletTopupSessionUsecase } from '@application/interfaces/usecases/wallet/ICreateWalletTopupSessionUsecase';
import { IDebitWalletUsecase } from '@application/interfaces/usecases/wallet/IDebitWalletUsecase';
import { IConfirmWalletTopupUsecase } from '@application/interfaces/usecases/wallet/IConfirmWalletTopupUsecase';
import { IPaymentGatewayService } from '@application/interfaces/services/IPaymentGatewayService';
import { ConfirmWalletTopupUsecase } from '@application/usecases/wallet/confirmWalletTopup.usecase';
import { IGetOrCreateWalletUsecase } from '@application/interfaces/usecases/wallet/IGetOrCreateWalletUsecase';
import { CreditWalletUsecase } from '@application/usecases/wallet/creditWallet.usecase';
import { CreateWalletTopupSessionUsecase } from '@application/usecases/wallet/createWalletTopupSession.usecase';
import { DebitWalletUsecase } from '@application/usecases/wallet/debitWallet.usecase';
import { GetOrCreateWalletUsecase } from '@application/usecases/wallet/getOrCreateWallet.usecase';
import { TYPES } from '@di/types.di';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { IWalletTransactionsRepository } from '@domain/repositories/IWallettransactionsRepo';
import { PrismaWalletRepository } from '@infrastructure/repositories/wallet/wallet.repo';
import { PrismaWalletTransactionsRepository } from '@infrastructure/repositories/wallet/wallet.transactions.repo';
import { RazorpayGatewayService } from '@infrastructure/services/payments/razorpay.gateway.service';
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
    bind<IPaymentGatewayService>(TYPES.IPaymentGatewayService).to(
        RazorpayGatewayService,
    );
    bind<IDebitWalletUsecase>(TYPES.IDebitWalletUsecase).to(DebitWalletUsecase);
    bind<ICreateWalletTopupSessionUsecase>(
        TYPES.ICreateWalletTopupSessionUsecase,
    ).to(CreateWalletTopupSessionUsecase);
    bind<IConfirmWalletTopupUsecase>(TYPES.IConfirmWalletTopupUsecase).to(
        ConfirmWalletTopupUsecase,
    );
});

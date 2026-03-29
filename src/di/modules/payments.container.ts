import { IAuctionEndQueue } from '@application/interfaces/queue/IAuctionEndQueue';
import { IWinnerFallbackQueue } from '@application/interfaces/queue/IWinnerFallbackQueue';
import { IDeclinePaymentUsecase } from '@application/interfaces/usecases/payments/IDeclinePaymentUsecase';
import { IProcessWinnerFallbackUsecase } from '@application/interfaces/usecases/payments/IProcessWinnerFallbackUsecase';
import { ICreatePaymentOrderUsecase } from '@application/interfaces/usecases/payments/ICreatePaymentOrderUsecase';
import { ICreatePendingPaymentForAuctionUsecase } from '@application/interfaces/usecases/payments/ICreatePendingPaymentForUsecase';
import { IGetUserPaymentsUsecase } from '@application/interfaces/usecases/payments/IGetUserPaymentsUsecase';
import { IVerifyPaymentUsecase } from '@application/interfaces/usecases/payments/IVerifyPaymentUsecase';
import { IAuctionPaymentAmountSplitStrategy } from '@application/interfaces/strategies/payments/IAuctionPaymentAmountStrategy';
import { AuctionPaymentAmountSplitStrategy } from '@application/strategies/payments/auctionPaymentAmountSplit.strategy';
import { CreatePaymentOrderUsecase } from '@application/usecases/payments/createPaymentOrder.usecase';
import { CreatePendingPaymentForAuctionUsecase } from '@application/usecases/payments/createPendingPaymentForAuction.usecase';
import { GetUserPaymentsUsecase } from '@application/usecases/payments/getUserPayments.usecase';
import { VerifyPaymentUsecase } from '@application/usecases/payments/verifyPayment.usecase';
import { DeclinePaymentUsecase } from '@application/usecases/payments/declinePayment.usecase';
import { ProcessWinnerFallbackUsecase } from '@application/usecases/payments/processWinnerFallback.usecase';
import { TYPES } from '@di/types.di';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { AuctionEndQueue } from '@infrastructure/queue/auctionEnd.queue';
import { WinnerFallbackQueue } from '@infrastructure/queue/winnerFallback.queue';
import { PrismaPaymentRepository } from '@infrastructure/repositories/payments/payments.repo';
import { ContainerModule } from 'inversify';

export const paymentsContainer = new ContainerModule(({ bind }) => {
    bind<IPaymentRepository>(TYPES.IPaymentRepository).to(
        PrismaPaymentRepository,
    );
    bind<IAuctionPaymentAmountSplitStrategy>(
        TYPES.IAuctionPaymentAmountSplitStrategy,
    ).to(AuctionPaymentAmountSplitStrategy);
    bind<ICreatePendingPaymentForAuctionUsecase>(
        TYPES.ICreatePendingPaymentForAuctionUsecase,
    ).to(CreatePendingPaymentForAuctionUsecase);

    bind<IAuctionEndQueue>(TYPES.IAuctionEndQueue).to(AuctionEndQueue);
    bind<IGetUserPaymentsUsecase>(TYPES.IGetUserPaymentsUsecase).to(
        GetUserPaymentsUsecase,
    );
    bind<ICreatePaymentOrderUsecase>(TYPES.ICreatePaymentOrderUsecase).to(
        CreatePaymentOrderUsecase,
    );
    bind<IVerifyPaymentUsecase>(TYPES.IVerifyPaymentUsecase).to(
        VerifyPaymentUsecase,
    );
    bind<IDeclinePaymentUsecase>(TYPES.IDeclinePaymentUsecase).to(
        DeclinePaymentUsecase,
    );
    bind<IWinnerFallbackQueue>(TYPES.IWinnerFallbackQueue).to(
        WinnerFallbackQueue,
    );
    bind<IProcessWinnerFallbackUsecase>(TYPES.IProcessWinnerFallbackUsecase).to(
        ProcessWinnerFallbackUsecase,
    );
});

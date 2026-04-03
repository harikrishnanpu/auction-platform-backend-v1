import { IAuctionEndQueue } from '@application/interfaces/queue/IAuctionEndQueue';
import { IAuctionWinnerFallbackQueue } from '@application/interfaces/queue/IWinnerFallbackQueue';
import { IDeclinePaymentUsecase } from '@application/interfaces/usecases/payments/IDeclinePaymentUsecase';
import { IProcessAuctionWinnerFallbackUsecase } from '@application/interfaces/usecases/auction/IProcessWinnerFallbackUsecase';
import { ICreatePaymentOrderUsecase } from '@application/interfaces/usecases/payments/ICreatePaymentOrderUsecase';
import { ICreatePendingPaymentForAuctionUsecase } from '@application/interfaces/usecases/payments/ICreatePendingPaymentForUsecase';
import { IGetSellerAuctionPaymentsUsecase } from '@application/interfaces/usecases/seller/IGetSellerAuctionPaymentsUsecase';
import { IGetUserPaymentsUsecase } from '@application/interfaces/usecases/payments/IGetUserPaymentsUsecase';
import { IVerifyPaymentUsecase } from '@application/interfaces/usecases/payments/IVerifyPaymentUsecase';
import { IAuctionPaymentAmountSplitStrategy } from '@application/interfaces/strategies/payments/IAuctionPaymentAmountStrategy';
import { AuctionPaymentAmountSplitStrategy } from '@application/strategies/payments/auctionPaymentAmountSplit.strategy';
import { CreatePaymentOrderUsecase } from '@application/usecases/payments/createPaymentOrder.usecase';
import { CreatePendingPaymentForAuctionUsecase } from '@application/usecases/payments/createPendingPaymentForAuction.usecase';
import { GetSellerAuctionPaymentsUsecase } from '@application/usecases/seller/getSellerAuctionPayments.usecase';
import { GetUserPaymentsUsecase } from '@application/usecases/payments/getUserPayments.usecase';
import { VerifyPaymentUsecase } from '@application/usecases/payments/verifyPayment.usecase';
import { DeclinePaymentUsecase } from '@application/usecases/payments/declinePayment.usecase';
import { ProcessAuctionWinnerFallbackUsecase } from '@application/usecases/auction/processAuctionWinnerFallback.usecase';
import { TYPES } from '@di/types.di';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { AuctionEndQueue } from '@infrastructure/queue/auctionEnd.queue';
import { AuctionWinnerFallbackQueue } from '@infrastructure/queue/AuctionWinnerFallback.queue';
import { PrismaPaymentRepository } from '@infrastructure/repositories/payments/payments.repo';
import { ContainerModule } from 'inversify';
import { CreatePaymentOrderForPublicFallbackAuctionUsecase } from '@application/usecases/payments/createPaymentOrderForPublicFallbackAuction';
import { ICreatePaymentOrderForPublicFallbackAuctionUsecase } from '@application/interfaces/usecases/payments/ICreatePaymentOrderForPublicFallbackAuctionUsecase';
import { VerifyPublicAuctionPaymentUsecase } from '@application/usecases/payments/verifyPublicAuctionPayment.usecase';
import { IVerifyFallbackPublicAuctionPaymentUsecase } from '@application/interfaces/usecases/payments/IVerifyFallbackPublicAuctionPaymentUsecase';

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
    bind<IGetSellerAuctionPaymentsUsecase>(
        TYPES.IGetSellerAuctionPaymentsUsecase,
    ).to(GetSellerAuctionPaymentsUsecase);
    bind<ICreatePaymentOrderUsecase>(TYPES.ICreatePaymentOrderUsecase).to(
        CreatePaymentOrderUsecase,
    );
    bind<IVerifyPaymentUsecase>(TYPES.IVerifyPaymentUsecase).to(
        VerifyPaymentUsecase,
    );
    bind<IDeclinePaymentUsecase>(TYPES.IDeclinePaymentUsecase).to(
        DeclinePaymentUsecase,
    );
    bind<IAuctionWinnerFallbackQueue>(TYPES.IAuctionWinnerFallbackQueue).to(
        AuctionWinnerFallbackQueue,
    );
    bind<IProcessAuctionWinnerFallbackUsecase>(
        TYPES.IProcessAuctionWinnerFallbackUsecase,
    ).to(ProcessAuctionWinnerFallbackUsecase);
    bind<ICreatePaymentOrderForPublicFallbackAuctionUsecase>(
        TYPES.ICreatePaymentOrderForPublicFallbackAuctionUsecase,
    ).to(CreatePaymentOrderForPublicFallbackAuctionUsecase);
    bind<IVerifyFallbackPublicAuctionPaymentUsecase>(
        TYPES.IVerifyFallbackPublicAuctionPaymentUsecase,
    ).to(VerifyPublicAuctionPaymentUsecase);
});

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AuthRouterFactory } from '@presentation/http/factories/auth.router.factory';
import { container } from '@di/container';
import { TYPES } from '@di/types.di';
import type { ILogger } from '@application/interfaces/services/ILogger';
import { errorMiddleware } from '@presentation/http/middlewares/error.middleware';
import { logMiddleware } from '@presentation/http/middlewares/log.middleware';
import { AuctionEndWorker } from '@infrastructure/workers/auctionEnd.worker';
import { AuctionWinnerFallbackWorker } from '@infrastructure/workers/auctionWinnerFallback.worker';
import { EmailWorker } from '@infrastructure/workers/email.worker';
import { TemplateService } from '@infrastructure/services/template/template.service';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { configureGoogleStrategy } from '@infrastructure/passport/passport.config';
import { UserRouterFactory } from '@presentation/http/factories/user.router.factory';
import { KycRouterFactory } from '@presentation/http/factories/kyc.router.factory';
import { AdminRouterFactory } from '@presentation/http/factories/admin.router.factory';
import { AuctionRouterFactory } from '@presentation/http/factories/auction.router.factory';
import { SellerRouterFactory } from '@presentation/http/factories/seller.router.factory';
import { IEventBus } from '@application/interfaces/events/IEventBus';
import { OnAuctionEndHandler } from '@application/event-handlers/onAuctionEnd.handler';
import { AuctionEnded } from '@domain/events/auction-end.event';
import { NotificationCreated } from '@domain/events/notitificationCreated.event';
import { OnNotificationCreatedHandler } from '@application/event-handlers/onNotificationCreated.handler';
import { WalletRouterFactory } from '@presentation/http/factories/wallet.router.factory';
import { PaymentsRouterFactory } from '@presentation/http/factories/payments.router.factory';

export const app = express();

const logger = container.get<ILogger>(TYPES.ILogger);

app.use(
    cors({
        credentials: true,
        origin: 'http://localhost:3000',
    }),
);

app.use(express.json());
app.use(logMiddleware(logger));

app.use(cookieParser());
app.use(passport.initialize());

configureGoogleStrategy();
new EmailWorker(new TemplateService());
new AuctionEndWorker();
new AuctionWinnerFallbackWorker();

const eventBus = container.get<IEventBus>(TYPES.IEventBus);

const onAuctionEndedHandler = container.get<OnAuctionEndHandler>(
    TYPES.OnAuctionEndHandler,
);

const onNotificationCreatedHandler =
    container.get<OnNotificationCreatedHandler>(
        TYPES.OnNotificationCreatedHandler,
    );

eventBus.subscribe('AuctionEnded', (event) => {
    console.log('AuctionEnded event received');
    onAuctionEndedHandler.handle(event as AuctionEnded);
});

eventBus.subscribe('NotificationCreated', (event) => {
    console.log('NotificationCreated event received');
    onNotificationCreatedHandler.handle(event as NotificationCreated);
});

// console.log('Event', eventBus);

app.use('/api/v1/auth', AuthRouterFactory.authRouter(container));
app.use('/api/v1/user', UserRouterFactory.userRouter(container));
app.use('/api/v1/kyc', KycRouterFactory.kycRouter(container));
app.use('/api/v1/admin', AdminRouterFactory.adminRouter(container));
app.use('/api/v1/auction', AuctionRouterFactory.auctionRouter(container));
app.use('/api/v1/seller', SellerRouterFactory.sellerRouter(container));
app.use('/api/v1/wallet', WalletRouterFactory.walletRouter(container));
app.use('/api/v1/payments', PaymentsRouterFactory.paymentsRouter(container));

app.use(errorMiddleware);

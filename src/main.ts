import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AuthRouterFactory } from '@presentation/http/factories/auth.router.factory';
import { container } from '@di/container';
import { TYPES } from '@di/types.di';
import type { ILogger } from '@application/interfaces/services/ILogger';
import { errorMiddleware } from '@presentation/http/middlewares/error.middleware';
import { logMiddleware } from '@presentation/http/middlewares/log.middleware';
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

app.use('/api/v1/auth', AuthRouterFactory.authRouter(container));
app.use('/api/v1/user', UserRouterFactory.userRouter(container));
app.use('/api/v1/kyc', KycRouterFactory.kycRouter(container));
app.use('/api/v1/admin', AdminRouterFactory.adminRouter(container));
app.use('/api/v1/auction', AuctionRouterFactory.auctionRouter(container));
app.use('/api/v1/seller', SellerRouterFactory.sellerRouter(container));

app.use(errorMiddleware);

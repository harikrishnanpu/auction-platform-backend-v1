import 'reflect-metadata';
import { Container } from 'inversify';
import { loggerContainer } from './modules/logger.container';
import { authContainer } from './modules/auth.container';
import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
import { TYPES } from './types.di';
import { AuthenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '@presentation/http/middlewares/authorize.middleware';
import { UserController } from '@presentation/http/controllers/user/user.controler';
import { userContainer } from './modules/user.container';
import { kycContainer } from './modules/kyc.container';
import { KycController } from '@presentation/http/controllers/kyc/kyc.controller';
import { AdminController } from '@presentation/http/controllers/admin/admin.controller';
import { adminContainer } from './modules/admin.container';
import { auctionContainer } from './modules/auction.container';
import { redisContainer } from './modules/redis.container';
import { AuctionController } from '@presentation/http/controllers/auction/auction.controller';
import { sellerContainer } from './modules/seller.container';
import { SellerController } from '@presentation/http/controllers/seller/seller.controller';
import { IEncryptionService } from '@application/interfaces/services/IEncryptionService';
import { EncryptService } from '@infrastructure/services/encrypt/encrypt.service';
import { PrismaNotificationRepo } from '@infrastructure/repositories/notifications/notification.repo';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { EventBus } from '@infrastructure/events/event-bus';
import { IEventBus } from '@application/interfaces/events/IEventBus';
import { OnAuctionEndHandler } from '@application/event-handlers/onAuctionEnd.handler';
import { OnNotificationCreatedHandler } from '@application/event-handlers/onNotificationCreated.handler';
import { walletContainer } from './modules/wallet.container';
import { WalletController } from '@presentation/http/controllers/wallet/wallet.controller';
import { paymentsContainer } from './modules/payments.container';
import { PaymentsController } from '@presentation/http/controllers/payments/payments.controller';

const container = new Container();

container.load(loggerContainer);
container.load(authContainer);
container.load(userContainer);
container.load(kycContainer);
container.load(adminContainer);
container.load(redisContainer);
container.load(auctionContainer);
container.load(sellerContainer);
container.load(walletContainer);
container.load(paymentsContainer);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<KycController>(TYPES.KycController).to(KycController);
container.bind<AdminController>(TYPES.AdminController).to(AdminController);
container.bind<SellerController>(TYPES.SellerController).to(SellerController);
container.bind<WalletController>(TYPES.WalletController).to(WalletController);
container
    .bind<PaymentsController>(TYPES.PaymentsController)
    .to(PaymentsController);

// --move for test only

container.bind<IEncryptionService>(TYPES.IEncryptionService).to(EncryptService);
container
    .bind<INotificationRepository>(TYPES.INotificationRepository)
    .to(PrismaNotificationRepo);

container.bind<IEventBus>(TYPES.IEventBus).to(EventBus).inSingletonScope();
container
    .bind<OnAuctionEndHandler>(TYPES.OnAuctionEndHandler)
    .to(OnAuctionEndHandler);
container
    .bind<OnNotificationCreatedHandler>(TYPES.OnNotificationCreatedHandler)
    .to(OnNotificationCreatedHandler);

container
    .bind<AuctionController>(TYPES.AuctionController)
    .to(AuctionController);

container
    .bind<AuthenticateMiddleware>(TYPES.AuthenticateMiddleware)
    .to(AuthenticateMiddleware);

container
    .bind<AuthorizeMiddleware>(TYPES.AuthorizeMiddleware)
    .to(AuthorizeMiddleware);

export { container };

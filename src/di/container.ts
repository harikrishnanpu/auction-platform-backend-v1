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
import { AuctionController } from '@presentation/http/controllers/auction/auction.controller';

const container = new Container();

container.load(loggerContainer);
container.load(authContainer);
container.load(userContainer);
container.load(kycContainer);
container.load(adminContainer);
container.load(auctionContainer);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container.bind<UserController>(TYPES.UserController).to(UserController);
container.bind<KycController>(TYPES.KycController).to(KycController);
container.bind<AdminController>(TYPES.AdminController).to(AdminController);
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

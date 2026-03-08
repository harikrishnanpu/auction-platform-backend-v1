import 'reflect-metadata';
import { Container } from 'inversify';
import { authContainer } from './modules/auth.container';
import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
import { TYPES } from './types.di';
import { AuthenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '@presentation/http/middlewares/authorize.middleware';

const container = new Container();

console.log('Initializing Global Container...');
container.load(authContainer);

container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container
  .bind<AuthenticateMiddleware>(TYPES.AuthenticateMiddleware)
  .to(AuthenticateMiddleware);
container
  .bind<AuthorizeMiddleware>(TYPES.AuthorizeMiddleware)
  .to(AuthorizeMiddleware);

export { container };

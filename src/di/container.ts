import 'reflect-metadata';
import { Container } from 'inversify';
import { authContainer } from './modules/auth.container';
import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
import { TYPES } from './types.di';

const container = new Container();

console.log('Initializing Global Container...');
container.load(authContainer);

container.bind<AuthController>(TYPES.AuthController).to(AuthController);

export { container };

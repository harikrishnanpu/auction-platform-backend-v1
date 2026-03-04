import { Container } from 'inversify';
import { authContainer } from './modules/auth.container';

export const container = new Container();

container.load(authContainer);

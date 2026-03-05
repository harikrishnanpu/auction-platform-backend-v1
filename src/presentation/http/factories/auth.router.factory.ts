import { AuthRoutes } from '../routes/auth/auth.routes';
import { AuthController } from '../controllers/auth/auth.controller';
import { TYPES } from 'di/types.di';
import { Container } from 'inversify';

export class AuthRouterFactory {
  public static authRouter(container: Container) {
    console.log('is bound: ', container.isBound(TYPES.AuthController));

    console.log('Is boun Class:', container.isBound(AuthController));
    console.log('Is boun symbol:', container.isBound(TYPES.AuthController));

    const authController = container.get<AuthController>(TYPES.AuthController);
    const authRoutes = new AuthRoutes(authController);
    return authRoutes.register();
  }
}

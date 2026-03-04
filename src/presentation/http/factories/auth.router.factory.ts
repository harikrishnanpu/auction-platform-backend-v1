import { container } from 'di/container';
import { AuthRoutes } from '../routes/auth/auth.routes';
import { AuthController } from '../controllers/auth/auth.controller';
import { TYPES } from 'di/types.di';

export class AuthRouterFactory {
  public static authRouter() {
    const authController = container.get<AuthController>(TYPES.AuthController);
    const authRoutes = new AuthRoutes(authController);
    return authRoutes.register();
  }
}

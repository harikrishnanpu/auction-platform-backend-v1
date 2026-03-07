import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
import { authenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { Router } from 'express';

export class AuthRoutes {
  private _router: Router;

  constructor(private _authController: AuthController) {
    this._router = Router();
  }

  register(): Router {
    this._router.post('/register', this._authController.register);

    this._router.post(
      '/send-verification-code',
      this._authController.sendVerificationCode,
    );

    this._router.post(
      '/verify-credentials',
      this._authController.verifyCredentials,
    );

    this._router.post('/login', this._authController.login);

    this._router.get(
      '/me',
      authenticateMiddleware,
      this._authController.getUser,
    );

    this._router.get('/google', this._authController.googleAuth);
    this._router.get(
      '/google/callback',
      this._authController.googleAuthCallback,
    );

    this._router.post(
      '/complete-profile',
      authenticateMiddleware,
      this._authController.completeProfile,
    );

    this._router.post('/forgot-password', this._authController.forgotPassword);

    this._router.post('/change-password', this._authController.changePassword);

    return this._router;
  }
}

import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
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

    return this._router;
  }
}

import { AuthController } from '@presentation/http/controllers/auth/auth.controller';
import { Router } from 'express';

export class AuthRoutes {
  private _router: Router;

  constructor(private _authController: AuthController) {
    this._router = Router();
  }

  register(): Router {
    this._router.post('/register', this._authController.register);

    return this._router;
  }
}

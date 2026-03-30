import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { PaymentsController } from '@presentation/http/controllers/payments/payments.controller';
import { AuthenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '@presentation/http/middlewares/authorize.middleware';
import { Router } from 'express';

export class PaymentsRoutes {
    private _router: Router;

    constructor(
        private readonly _paymentsController: PaymentsController,
        private readonly _authenticateMiddleware: AuthenticateMiddleware,
        private readonly _authorizeMiddleware: AuthorizeMiddleware,
    ) {
        this._router = Router();
    }

    register(): Router {
        this._router.use(this._authenticateMiddleware.authenticate);
        this._router.use(
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
        );

        this._router.get('/', this._paymentsController.getUserPayments);
        this._router.post(
            '/create-order',
            this._paymentsController.createPaymentOrder,
        );

        this._router.post('/verify', this._paymentsController.verifyPayment);
        this._router.post('/decline', this._paymentsController.declinePayment);

        return this._router;
    }
}

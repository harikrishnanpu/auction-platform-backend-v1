import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { TYPES } from '@di/types.di';
import { FraudController } from '@presentation/http/controllers/fraud/fraud.controller';
import { AuthenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '@presentation/http/middlewares/authorize.middleware';
import { Router } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class FraudRoutes {
    private _router: Router;

    constructor(
        @inject(TYPES.FraudController)
        private readonly _fraudController: FraudController,
        @inject(TYPES.AuthenticateMiddleware)
        private readonly _authenticateMiddleware: AuthenticateMiddleware,
        @inject(TYPES.AuthorizeMiddleware)
        private readonly _authorizeMiddleware: AuthorizeMiddleware,
    ) {
        this._router = Router();
    }

    register(): Router {
        this._router.post(
            '/reports',
            this._authenticateMiddleware.authenticate,
            this._fraudController.createReport,
        );

        this._router.get(
            '/reports',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
            this._fraudController.getReports,
        );

        this._router.patch(
            '/reports/:id/under-review',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
            this._fraudController.markUnderReview,
        );

        this._router.patch(
            '/reports/:id/review',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
            this._fraudController.reviewReport,
        );
        this._router.patch(
            '/reports/:id',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
            this._fraudController.updateReport,
        );

        this._router.get(
            '/suspended-users',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
            this._fraudController.getSuspendedUsers,
        );

        this._router.get(
            '/suspended-users/:userId/timeline',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.ADMIN]),
            this._fraudController.getSuspensionTimeline,
        );

        return this._router;
    }
}

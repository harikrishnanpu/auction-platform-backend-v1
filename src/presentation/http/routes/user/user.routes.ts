import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { UserController } from '@presentation/http/controllers/user/user.controler';
import { AuthenticateMiddleware } from '@presentation/http/middlewares/authenticate.middleware';
import { AuthorizeMiddleware } from '@presentation/http/middlewares/authorize.middleware';
import { Router } from 'express';

export class UserRoutes {
    private _router: Router;

    constructor(
        private readonly _userController: UserController,
        private readonly _authenticateMiddleware: AuthenticateMiddleware,
        private readonly _authorizeMiddleware: AuthorizeMiddleware,
    ) {
        this._router = Router();
    }

    register(): Router {
        this._router.post(
            '/send-profile-change-password-otp',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
            this._userController.sendProfileChangePasswordOtp,
        );
        this._router.put(
            '/change-profile-password',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
            this._userController.changeProfilePassword,
        );
        this._router.post(
            '/edit-profile-send-otp',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
            this._userController.editProfileSendOtp,
        );
        this._router.put(
            '/edit-profile',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
            this._userController.editProfile,
        );

        this._router.post(
            '/generate-avatar-upload-url',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
            this._userController.generateAvatarUploadUrl,
        );

        this._router.put(
            '/update-avatar-url',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
            this._userController.updateAvatarUrl,
        );

        this._router.get(
            '/notifications',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
            this._userController.getNotifications,
        );

        this._router.get(
            '/notifications/stream',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
            this._userController.streamNotifications,
        );

        this._router.get(
            '/my-auctions',
            this._authenticateMiddleware.authenticate,
            this._authorizeMiddleware.authorize([UserRoleType.USER]),
            this._userController.getMyAuctions,
        );

        return this._router;
    }
}

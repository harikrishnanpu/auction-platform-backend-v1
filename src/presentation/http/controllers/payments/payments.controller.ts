import { ICreatePaymentOrderUsecase } from '@application/interfaces/usecases/payments/ICreatePaymentOrderUsecase';
import { IGetUserPaymentsUsecase } from '@application/interfaces/usecases/payments/IGetUserPaymentsUsecase';
import { IVerifyPaymentUsecase } from '@application/interfaces/usecases/payments/IVerifyPaymentUsecase';
import { IDeclinePaymentUsecase } from '@application/interfaces/usecases/payments/IDeclinePaymentUsecase';
import { TYPES } from '@di/types.di';
import { PAYMENTS_CONSTANTS } from '@presentation/constants/payments/payments.constants';
import { AppError } from '@presentation/http/error/app.error';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import {
    getUsersPaymentsSchema,
    ZodGetUsersPaymentsInputType,
} from '@presentation/validators/schemas/payments/getUsersPayments.schema';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import {
    createPaymentOrderSchema,
    ZodCreatePaymentOrderInputType,
} from '@presentation/validators/schemas/payments/createPayementOrder.schema';
import {
    verifyPaymentSchema,
    ZodVerifyPaymentInputType,
} from '@presentation/validators/schemas/payments/verifyPayment.schema';
import {
    declinePaymentSchema,
    ZodDeclinePaymentInputType,
} from '@presentation/validators/schemas/payments/declinePayments.schema';

@injectable()
export class PaymentsController {
    constructor(
        @inject(TYPES.IGetUserPaymentsUsecase)
        private readonly _getUserPaymentsUsecase: IGetUserPaymentsUsecase,
        @inject(TYPES.ICreatePaymentOrderUsecase)
        private readonly _createPaymentOrderUsecase: ICreatePaymentOrderUsecase,
        @inject(TYPES.IVerifyPaymentUsecase)
        private readonly _verifyPaymentUsecase: IVerifyPaymentUsecase,
        @inject(TYPES.IDeclinePaymentUsecase)
        private readonly _declinePaymentUsecase: IDeclinePaymentUsecase,
    ) {}

    /**
     * Lists the authenticated user's auction-related payments with filters from `query`.
     *
     * @param req - Express request; `query` merged with `userId`, validated with `getUsersPaymentsSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after paged payments are sent
     * @throws {AppError} When `req.user` is missing, validation fails, or fetch fails
     */
    getUserPayments = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    PAYMENTS_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    PAYMENTS_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodGetUsersPaymentsInputType>(
                    getUsersPaymentsSchema,
                    {
                        ...req.query,
                        userId: req.user.id,
                    } as unknown as ZodGetUsersPaymentsInputType,
                );

            const result =
                await this._getUserPaymentsUsecase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    PAYMENTS_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success(
                res,
                result.getValue(),
                PAYMENTS_CONSTANTS.MESSAGES.GET_PAYMENTS_SUCCESSFULLY,
                PAYMENTS_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Creates a Razorpay order for paying a pending payment row owned by the user.
     *
     * @param req - Express request; `body` validated with `createPaymentOrderSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after order metadata is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or order creation fails
     */
    createPaymentOrder = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    PAYMENTS_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    PAYMENTS_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodCreatePaymentOrderInputType>(
                    createPaymentOrderSchema,
                    req.body,
                );

            const result = await this._createPaymentOrderUsecase.execute({
                userId: req.user.id,
                paymentId: validationResult.paymentId,
            });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    PAYMENTS_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success(
                res,
                result.getValue(),
                PAYMENTS_CONSTANTS.MESSAGES.CREATE_PAYMENT_ORDER_SUCCESSFULLY,
                PAYMENTS_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Confirms a payment after Razorpay client success using validated body fields.
     *
     * @param req - Express request; `body` merged with `userId`, validated with `verifyPaymentSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after verification acknowledgement is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or verification fails
     */
    verifyPayment = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                PAYMENTS_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                PAYMENTS_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const validationResult =
            ValidationHelper.validate<ZodVerifyPaymentInputType>(
                verifyPaymentSchema,
                {
                    ...req.body,
                    userId: req.user.id,
                },
            );

        const result =
            await this._verifyPaymentUsecase.execute(validationResult);

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                PAYMENTS_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success(
            res,
            null,
            PAYMENTS_CONSTANTS.MESSAGES.VERIFY_PAYMENT_SUCCESSFULLY,
            PAYMENTS_CONSTANTS.CODES.OK,
        );
    });

    /**
     * Declines a pending payment on behalf of the authenticated payer.
     *
     * @param req - Express request; `body` validated with `declinePaymentSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after decline acknowledgement is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or decline fails
     */
    declinePayment = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    PAYMENTS_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    PAYMENTS_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodDeclinePaymentInputType>(
                    declinePaymentSchema,
                    req.body,
                );

            const result = await this._declinePaymentUsecase.execute({
                userId: req.user.id,
                paymentId: validationResult.paymentId,
            });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    PAYMENTS_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success(
                res,
                null,
                PAYMENTS_CONSTANTS.MESSAGES.DECLINE_PAYMENT_SUCCESSFULLY,
                PAYMENTS_CONSTANTS.CODES.OK,
            );
        },
    );
}

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
import { PaymentsMapperProfile } from '@application/mappers/payments/paymentsProfile.mapper';
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
                    req.query as unknown as ZodGetUsersPaymentsInputType,
                );

            const dto = PaymentsMapperProfile.toGetUserPaymentsInputDto(
                validationResult,
                req.user.id,
            );

            const result = await this._getUserPaymentsUsecase.execute(dto);

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
                req.body,
            );

        const result = await this._verifyPaymentUsecase.execute({
            userId: req.user.id,
            paymentId: validationResult.paymentId,
            orderId: validationResult.orderId,
            gatewayPaymentId: validationResult.gatewayPaymentId,
            signature: validationResult.signature,
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
            PAYMENTS_CONSTANTS.MESSAGES.VERIFY_PAYMENT_SUCCESSFULLY,
            PAYMENTS_CONSTANTS.CODES.OK,
        );
    });

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

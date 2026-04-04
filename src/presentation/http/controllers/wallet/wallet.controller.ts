import { TYPES } from '@di/types.di';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { IGetOrCreateWalletUsecase } from '@application/interfaces/usecases/wallet/IGetOrCreateWalletUsecase';
import { AppError } from '@presentation/http/error/app.error';
import { WALLET_CONSTANTS } from '@presentation/constants/wallet/wallet.constants';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { ICreditWalletUsecase } from '@application/interfaces/usecases/wallet/ICreditWalletUsecase';
import { IDebitWalletUsecase } from '@application/interfaces/usecases/wallet/IDebitWalletUsecase';
import { ICreateWalletTopupSessionUsecase } from '@application/interfaces/usecases/wallet/ICreateWalletTopupSessionUsecase';
import { IConfirmWalletTopupUsecase } from '@application/interfaces/usecases/wallet/IConfirmWalletTopupUsecase';
import {
    creditWalletSchema,
    ZodCreditWalletInputType,
} from '@presentation/validators/schemas/wallet/creditWallet.schema';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import {
    debitWalletSchema,
    ZodDebitWalletInputType,
} from '@presentation/validators/schemas/wallet/debitWallt.schema';
import {
    createWalletTopupSchema,
    ZodCreateWalletTopupInputType,
} from '@presentation/validators/schemas/wallet/createWalletTopup.schema';
import {
    verifyWalletTopupSchema,
    ZodVerifyWalletTopupInputType,
} from '@presentation/validators/schemas/wallet/verifyTopUp.schema';

@injectable()
export class WalletController {
    constructor(
        @inject(TYPES.IGetOrCreateWalletUsecase)
        private readonly _getOrCreateWalletUsecase: IGetOrCreateWalletUsecase,
        @inject(TYPES.ICreditWalletUsecase)
        private readonly _creditWalletUsecase: ICreditWalletUsecase,
        @inject(TYPES.IDebitWalletUsecase)
        private readonly _debitWalletUsecase: IDebitWalletUsecase,
        @inject(TYPES.ICreateWalletTopupSessionUsecase)
        private readonly _createWalletTopupSessionUsecase: ICreateWalletTopupSessionUsecase,
        @inject(TYPES.IConfirmWalletTopupUsecase)
        private readonly _confirmWalletTopupUsecase: IConfirmWalletTopupUsecase,
    ) {}

    getWallet = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                WALLET_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                WALLET_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const result = await this._getOrCreateWalletUsecase.execute({
            userId: req.user.id,
        });

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                WALLET_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success(
            res,
            result.getValue(),
            WALLET_CONSTANTS.MESSAGES.GET_WALLET_SUCCESSFULLY,
            WALLET_CONSTANTS.CODES.OK,
        );
    });

    creditWallet = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                WALLET_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                WALLET_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const validationResult =
            ValidationHelper.validate<ZodCreditWalletInputType>(
                creditWalletSchema,
                req.body,
            );

        const result = await this._creditWalletUsecase.execute({
            userId: req.user.id,
            amount: validationResult.amount,
        });

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                WALLET_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success(
            res,
            result.getValue(),
            WALLET_CONSTANTS.MESSAGES.CREDIT_WALLET_SUCCESSFULLY,
            WALLET_CONSTANTS.CODES.OK,
        );
    });

    debitWallet = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                WALLET_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                WALLET_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const validationResult =
            ValidationHelper.validate<ZodDebitWalletInputType>(
                debitWalletSchema,
                req.body,
            );

        const result = await this._debitWalletUsecase.execute({
            userId: req.user.id,
            amount: validationResult.amount,
        });

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                WALLET_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success(
            res,
            result.getValue(),
            WALLET_CONSTANTS.MESSAGES.DEBIT_WALLET_SUCCESSFULLY,
            WALLET_CONSTANTS.CODES.OK,
        );
    });

    createTopupOrder = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    WALLET_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    WALLET_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            const validationResult =
                ValidationHelper.validate<ZodCreateWalletTopupInputType>(
                    createWalletTopupSchema,
                    req.body,
                );

            const result = await this._createWalletTopupSessionUsecase.execute({
                userId: req.user.id,
                amount: validationResult.amount,
            });

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    WALLET_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success(
                res,
                result.getValue(),
                WALLET_CONSTANTS.MESSAGES.CREATE_TOPUP_ORDER_SUCCESSFULLY,
                WALLET_CONSTANTS.CODES.OK,
            );
        },
    );

    verifyTopup = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                WALLET_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                WALLET_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const validationResult =
            ValidationHelper.validate<ZodVerifyWalletTopupInputType>(
                verifyWalletTopupSchema,
                req.body,
            );

        const result = await this._confirmWalletTopupUsecase.execute({
            userId: req.user.id,
            orderId: validationResult.orderId,
            paymentId: validationResult.paymentId,
            signature: validationResult.signature,
        });

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                WALLET_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success(
            res,
            result.getValue(),
            WALLET_CONSTANTS.MESSAGES.VERIFY_TOPUP_SUCCESSFULLY,
            WALLET_CONSTANTS.CODES.OK,
        );
    });
}

import { TYPES } from '@di/types.di';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { IGetOrCreateWalletUsecase } from '@application/interfaces/usecases/wallet/IGetOrCreateWalletUsecase';
import { AppError } from '@presentation/http/error/app.error';
import { WALLET_CONSTANTS } from '@presentation/constants/wallet/wallet.constants';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { ICreditWalletUsecase } from '@application/interfaces/usecases/wallet/ICreditWalletUsecase';

@injectable()
export class WalletController {
    constructor(
        @inject(TYPES.IWalletRepository)
        private readonly _walletRepository: IWalletRepository,
        @inject(TYPES.IGetOrCreateWalletUsecase)
        private readonly _getOrCreateWalletUsecase: IGetOrCreateWalletUsecase,
        @inject(TYPES.ICreditWalletUsecase)
        private readonly _creditWalletUsecase: ICreditWalletUsecase,
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

        const result = await this._creditWalletUsecase.execute({
            userId: req.user.id,
            amount: req.body.amount,
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
}

import expressAsyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import {
    uploadKycUrlSchema,
    ZodUploadKycUrlInputType,
} from '@presentation/validators/schemas/kyc/uploadKyc.schema';
import { AppError } from '@presentation/http/error/app.error';
import { KYC_CONSTANTS } from '@presentation/constants/kyc/kyc.constants';
import { UploadKycGetUrlOutput } from '@application/dtos/kyc/upload-kyc.dto';
import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';
import { IGetKycStatusOutput } from '@application/dtos/kyc/get-kyc-status.usecase';
import { IGetKycStatusUsecase } from '@application/interfaces/usecases/kyc/IGetKycStatusUsecase';
import {
    getKycStatusSchema,
    ZodGetKycStatusInputType,
} from '@presentation/validators/schemas/kyc/getKycStatus.schema';
import { IGetKycUploadUrlUsecase } from '@application/interfaces/usecases/kyc/IGetKycUploadUrlUsecase';
import {
    updateKycSchema,
    ZodUpdateKycInputType,
} from '@presentation/validators/schemas/kyc/updateKyc.schema';
import { IUpdateKycOutput } from '@application/dtos/kyc/update-kyc.dto';
import { IUpdateKycUsecase } from '@application/interfaces/usecases/kyc/IUpdateKyc';
import {
    submitKycSchema,
    ZodSubmitKycInputType,
} from '@presentation/validators/schemas/kyc/submitKyc.schema';
import { ISubmitKycUsecase } from '@application/interfaces/usecases/kyc/ISubmitKycUsecase';
import { ISubmitKycOutput } from '@application/dtos/kyc/submit-kyc.dto';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';

@injectable()
export class KycController {
    constructor(
        @inject(TYPES.IGetKycUploadUrlUsecase)
        private readonly _getKycUploadUrlUsecase: IGetKycUploadUrlUsecase,
        @inject(TYPES.IGetKycStatusUsecase)
        private readonly _getKycStatusUsecase: IGetKycStatusUsecase,
        @inject(TYPES.IUpdateKycUsecase)
        private readonly _updateKycUsecase: IUpdateKycUsecase,
        @inject(TYPES.ISubmitKycUsecase)
        private readonly _submitKycUsecase: ISubmitKycUsecase,
    ) {}

    /**
     * Returns a secure upload target (e.g. pre-signed URL) for a KYC document described in the body.
     *
     * @param req - Express request; `body` validated with `uploadKycUrlSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after upload URL payload is sent
     * @throws {AppError} When validation fails or URL generation fails
     */
    getKycUploadUrl = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const validationResult =
                ValidationHelper.validate<ZodUploadKycUrlInputType>(
                    uploadKycUrlSchema,
                    req.body,
                );

            const result =
                await this._getKycUploadUrlUsecase.execute(validationResult);

            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    KYC_CONSTANTS.CODES.BAD_REQUEST,
                );
            }

            ResponseHelper.success<UploadKycGetUrlOutput>(
                res,
                result.getValue(),
                KYC_CONSTANTS.MESSAGES.KYC_URL_UPLOADED_SUCCESSFULLY,
                KYC_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Returns KYC workflow status for the authenticated user.
     *
     * @param req - Express request; `body` merged with `userId` from `req.user`, validated with `getKycStatusSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after status DTO is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or lookup fails
     */
    getKycStatus = expressAsyncHandler(async (req: Request, res: Response) => {
        console.log('getKycStatus controller called');

        if (!req.user) {
            throw new AppError(
                KYC_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                KYC_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const validationResult =
            ValidationHelper.validate<ZodGetKycStatusInputType>(
                getKycStatusSchema,
                {
                    ...req.body,
                    userId: req.user.id,
                },
            );

        const result =
            await this._getKycStatusUsecase.execute(validationResult);

        if (result.isFailure) {
            console.log('error', result.getError());
            throw new AppError(
                result.getError(),
                KYC_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        // console.log('KYC STATUS RESPONSE:', result.getValue());

        ResponseHelper.success<IGetKycStatusOutput>(
            res,
            result.getValue(),
            KYC_CONSTANTS.MESSAGES.KYC_STATUS_FETCHED_SUCCESSFULLY,
            KYC_CONSTANTS.CODES.OK,
        );
    });

    /**
     * Updates KYC draft fields/documents for the authenticated user before submission.
     *
     * @param req - Express request; `body` merged with `userId` and validated with `updateKycSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after updated KYC payload is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or update fails
     */
    updateKyc = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                KYC_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                KYC_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        console.log(req.body);

        const validationResult =
            ValidationHelper.validate<ZodUpdateKycInputType>(updateKycSchema, {
                ...req.body,
                userId: req.user.id,
            });

        const result = await this._updateKycUsecase.execute(validationResult);

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                KYC_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<IUpdateKycOutput>(
            res,
            result.getValue(),
            KYC_CONSTANTS.MESSAGES.KYC_UPDATED_SUCCESSFULLY,
            KYC_CONSTANTS.CODES.OK,
        );
    });

    /**
     * Submits KYC for review for the authenticated user.
     *
     * @param req - Express request; `body` merged with `userId` and validated with `submitKycSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after submission result is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or submit fails
     */
    submitKyc = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                KYC_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                KYC_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        const validationResult =
            ValidationHelper.validate<ZodSubmitKycInputType>(submitKycSchema, {
                ...req.body,
                userId: req.user.id,
            });

        const result = await this._submitKycUsecase.execute(validationResult);

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                KYC_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success<ISubmitKycOutput>(
            res,
            result.getValue(),
            KYC_CONSTANTS.MESSAGES.KYC_SUBMITTED_SUCCESSFULLY,
            KYC_CONSTANTS.CODES.OK,
        );
    });
}

import { ICreateFraudReportUsecase } from '@application/interfaces/usecases/fraud/ICreateFraudReportUsecase';
import { IGetFraudReportsUsecase } from '@application/interfaces/usecases/fraud/IGetFraudReportsUsecase';
import { IGetSuspendedUsersUsecase } from '@application/interfaces/usecases/fraud/IGetSuspendedUsersUsecase';
import { IReviewFraudReportUsecase } from '@application/interfaces/usecases/fraud/IReviewFraudReportUsecase';
import { IMarkFraudReportUnderReviewUsecase } from '@application/interfaces/usecases/fraud/IMarkFraudReportUnderReviewUsecase';
import { IUpdateFraudReportUsecase } from '@application/interfaces/usecases/fraud/IUpdateFraudReportUsecase';
import { TYPES } from '@di/types.di';
import {
    FraudAdminDecision,
    FraudReportCategory,
    FraudReportLevel,
    FraudReportStatus,
    FraudReporterType,
    FraudReportSource,
} from '@domain/entities/fraud/fraud-report.entity';
import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { AppError } from '@presentation/http/error/app.error';
import { FRAUD_CONSTANTS } from '@presentation/constants/fraud/fraud.constants';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { ValidationHelper } from '@presentation/http/helpers/validation.helper';
import {
    createFraudReportSchema,
    ZodCreateFraudReportInputType,
} from '@presentation/validators/schemas/fraud/createFraudReport.schema';
import {
    getFraudReportsSchema,
    ZodGetFraudReportsInputType,
} from '@presentation/validators/schemas/fraud/getFraudReports.schema';
import {
    reviewFraudReportSchema,
    ZodReviewFraudReportInputType,
} from '@presentation/validators/schemas/fraud/reviewFraudReport.schema';
import {
    getSuspendedUsersSchema,
    ZodGetSuspendedUsersInputType,
} from '@presentation/validators/schemas/fraud/getSuspendedUsers.schema';
import {
    getSuspensionTimelineSchema,
    ZodGetSuspensionTimelineInputType,
} from '@presentation/validators/schemas/fraud/getSuspensionTimeline.schema';
import {
    updateFraudReportSchema,
    ZodUpdateFraudReportInputType,
} from '@presentation/validators/schemas/fraud/updateFraudReport.schema';
import { IGetSuspensionUsersUsecase } from '@application/interfaces/usecases/fraud/IGetSuspensionTimelineUsecase';

@injectable()
export class FraudController {
    constructor(
        @inject(TYPES.ICreateFraudReportUsecase)
        private readonly _createFraudReportUsecase: ICreateFraudReportUsecase,
        @inject(TYPES.IGetFraudReportsUsecase)
        private readonly _getFraudReportsUsecase: IGetFraudReportsUsecase,
        @inject(TYPES.IReviewFraudReportUsecase)
        private readonly _reviewFraudReportUsecase: IReviewFraudReportUsecase,
        @inject(TYPES.IMarkFraudReportUnderReviewUsecase)
        private readonly _markFraudReportUnderReviewUsecase: IMarkFraudReportUnderReviewUsecase,
        @inject(TYPES.IGetSuspendedUsersUsecase)
        private readonly _getSuspendedUsersUsecase: IGetSuspendedUsersUsecase,
        @inject(TYPES.IGetSuspensionUsersUsecase)
        private readonly _getSuspensionUsersUsecase: IGetSuspensionUsersUsecase,
        @inject(TYPES.IUpdateFraudReportUsecase)
        private readonly _updateFraudReportUsecase: IUpdateFraudReportUsecase,
    ) {}

    /**
     * Creates a fraud report filed by the authenticated reporter against another user.
     *
     * @param req - Express request; `body` validated with `createFraudReportSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after created report payload is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or persistence fails
     */
    createReport = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                FRAUD_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                FRAUD_CONSTANTS.CODES.UNAUTHORIZED,
            );
        }

        const body = ValidationHelper.validate<ZodCreateFraudReportInputType>(
            createFraudReportSchema,
            req.body,
        );

        const result = await this._createFraudReportUsecase.execute({
            reportedUserId: req.user.id,
            targetedUserId: body.targetedUserId,
            source: FraudReportSource.MANUAL,
            reportedUserType: body.reportedUserType as FraudReporterType,
            category: body.category as FraudReportCategory,
            level: body.level as FraudReportLevel,
            reason: body.reason,
        });

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                FRAUD_CONSTANTS.CODES.BAD_REQUEST,
            );
        }

        ResponseHelper.success(
            res,
            result.getValue(),
            FRAUD_CONSTANTS.MESSAGES.CREATE_REPORT_SUCCESSFULLY,
            FRAUD_CONSTANTS.CODES.CREATED,
        );
    });

    /**
     * Lists fraud reports with optional filters from `query`.
     *
     * @param req - Express request; `query` validated with `getFraudReportsSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after paged reports are sent
     * @throws {AppError} When validation fails or fetch fails
     */
    getReports = expressAsyncHandler(async (req: Request, res: Response) => {
        const query = ValidationHelper.validate<ZodGetFraudReportsInputType>(
            getFraudReportsSchema,
            req.query as unknown as ZodGetFraudReportsInputType,
        );

        const result = await this._getFraudReportsUsecase.execute({
            ...query,
            status: query.status as FraudReportStatus | undefined,
        });

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                FRAUD_CONSTANTS.CODES.BAD_REQUEST,
            );
        }
        ResponseHelper.success(
            res,
            result.getValue(),
            FRAUD_CONSTANTS.MESSAGES.GET_REPORTS_SUCCESSFULLY,
            FRAUD_CONSTANTS.CODES.OK,
        );
    });

    /**
     * Admin decision on a fraud report (`req.params.id`) with validated body.
     *
     * @param req - Express request; `params.id` is report id, `body` validated with `reviewFraudReportSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after review acknowledgement is sent
     * @throws {AppError} When `req.user` is missing, validation fails, or review fails
     */
    reviewReport = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                FRAUD_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                FRAUD_CONSTANTS.CODES.UNAUTHORIZED,
            );
        }
        const body = ValidationHelper.validate<ZodReviewFraudReportInputType>(
            reviewFraudReportSchema,
            { ...req.body, reportId: req.params.id },
        );
        const result = await this._reviewFraudReportUsecase.execute({
            reportId: body.reportId,
            adminUserId: req.user.id,
            decision: body.decision as FraudAdminDecision,
            note: body.note,
        });
        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                FRAUD_CONSTANTS.CODES.BAD_REQUEST,
            );
        }
        ResponseHelper.success(
            res,
            null,
            FRAUD_CONSTANTS.MESSAGES.REVIEW_REPORT_SUCCESSFULLY,
            FRAUD_CONSTANTS.CODES.OK,
        );
    });

    /**
     * Updates mutable fields on a fraud report identified by `req.params.id`.
     *
     * @param req - Express request; `body` + `params.id` validated with `updateFraudReportSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after update acknowledgement is sent
     * @throws {AppError} When validation fails or update fails
     */
    updateReport = expressAsyncHandler(async (req: Request, res: Response) => {
        const body = ValidationHelper.validate<ZodUpdateFraudReportInputType>(
            updateFraudReportSchema,
            { ...req.body, reportId: req.params.id as string },
        );

        const result = await this._updateFraudReportUsecase.execute({
            reportId: body.reportId,
            category: body.category as FraudReportCategory | undefined,
            status: body.status as FraudReportStatus | undefined,
            decision: body.decision as FraudAdminDecision,
            reporterType: body.reporterType as FraudReporterType,
            source: body.source as FraudReportSource,
            level: body.level as FraudReportLevel | undefined,
        });

        if (result.isFailure) {
            throw new AppError(
                result.getError(),
                FRAUD_CONSTANTS.CODES.BAD_REQUEST,
            );
        }
        ResponseHelper.success(
            res,
            null,
            FRAUD_CONSTANTS.MESSAGES.REVIEW_REPORT_SUCCESSFULLY,
            FRAUD_CONSTANTS.CODES.OK,
        );
    });

    /**
     * Marks a fraud report as under review by the authenticated admin.
     *
     * @param req - Express request; `params.id` is report id; `user` is admin from auth middleware
     * @param res - Express response for JSON output
     * @returns Promise that settles after acknowledgement is sent
     * @throws {AppError} When `req.user` is missing or the transition fails
     */
    markUnderReview = expressAsyncHandler(
        async (req: Request, res: Response) => {
            if (!req.user) {
                throw new AppError(
                    FRAUD_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                    FRAUD_CONSTANTS.CODES.UNAUTHORIZED,
                );
            }
            const result =
                await this._markFraudReportUnderReviewUsecase.execute({
                    reportId: req.params.id as string,
                    adminUserId: req.user.id,
                });
            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    FRAUD_CONSTANTS.CODES.BAD_REQUEST,
                );
            }
            ResponseHelper.success(
                res,
                null,
                FRAUD_CONSTANTS.MESSAGES.MARK_UNDER_REVIEW_SUCCESSFULLY,
                FRAUD_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Lists users currently suspended for fraud or policy reasons (admin query).
     *
     * @param req - Express request; `query` validated with `getSuspendedUsersSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after list payload is sent
     * @throws {AppError} When validation fails or fetch fails
     */
    getSuspendedUsers = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const query =
                ValidationHelper.validate<ZodGetSuspendedUsersInputType>(
                    getSuspendedUsersSchema,
                    req.query as unknown as ZodGetSuspendedUsersInputType,
                );
            const result = await this._getSuspendedUsersUsecase.execute(query);
            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    FRAUD_CONSTANTS.CODES.BAD_REQUEST,
                );
            }
            ResponseHelper.success(
                res,
                result.getValue(),
                FRAUD_CONSTANTS.MESSAGES.GET_SUSPENDED_USERS_SUCCESSFULLY,
                FRAUD_CONSTANTS.CODES.OK,
            );
        },
    );

    /**
     * Returns suspension timeline/history for a user id from `req.params.userId`.
     *
     * @param req - Express request; `params.userId` validated with `getSuspensionTimelineSchema`
     * @param res - Express response for JSON output
     * @returns Promise that settles after timeline payload is sent
     * @throws {AppError} When validation fails or lookup fails
     */
    getSuspensionTimeline = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const params =
                ValidationHelper.validate<ZodGetSuspensionTimelineInputType>(
                    getSuspensionTimelineSchema,
                    { userId: req.params.userId as string },
                );
            const result = await this._getSuspensionUsersUsecase.execute(
                params.userId,
            );
            if (result.isFailure) {
                throw new AppError(
                    result.getError(),
                    FRAUD_CONSTANTS.CODES.BAD_REQUEST,
                );
            }
            ResponseHelper.success(
                res,
                result.getValue(),
                FRAUD_CONSTANTS.MESSAGES.GET_SUSPENSION_TIMELINE_SUCCESSFULLY,
                FRAUD_CONSTANTS.CODES.OK,
            );
        },
    );
}

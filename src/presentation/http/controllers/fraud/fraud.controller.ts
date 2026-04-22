import { ICreateFraudReportUsecase } from '@application/interfaces/usecases/fraud/ICreateFraudReportUsecase';
import { IGetFraudReportsUsecase } from '@application/interfaces/usecases/fraud/IGetFraudReportsUsecase';
import { IGetSuspendedUsersUsecase } from '@application/interfaces/usecases/fraud/IGetSuspendedUsersUsecase';
import { IGetSuspensionTimelineUsecase } from '@application/interfaces/usecases/fraud/IGetSuspensionTimelineUsecase';
import { IReviewFraudReportUsecase } from '@application/interfaces/usecases/fraud/IReviewFraudReportUsecase';
import { IMarkFraudReportUnderReviewUsecase } from '@application/interfaces/usecases/fraud/IMarkFraudReportUnderReviewUsecase';
import { IUpdateFraudReportUsecase } from '@application/interfaces/usecases/fraud/IUpdateFraudReportUsecase';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
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
        @inject(TYPES.IGetSuspensionTimelineUsecase)
        private readonly _getSuspensionTimelineUsecase: IGetSuspensionTimelineUsecase,
        @inject(TYPES.IUpdateFraudReportUsecase)
        private readonly _updateFraudReportUsecase: IUpdateFraudReportUsecase,
    ) {}

    createReport = expressAsyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new AppError(
                FRAUD_CONSTANTS.MESSAGES.USER_NOT_FOUND,
                FRAUD_CONSTANTS.CODES.UNAUTHORIZED,
            );
        }
        const hasPermission = req.user.roles.some((role) =>
            [
                UserRoleType.USER,
                UserRoleType.SELLER,
                UserRoleType.ADMIN,
            ].includes(role),
        );
        if (!hasPermission) {
            throw new AppError(
                'Unauthorized to create report',
                FRAUD_CONSTANTS.CODES.UNAUTHORIZED,
            );
        }
        const body = ValidationHelper.validate<ZodCreateFraudReportInputType>(
            createFraudReportSchema,
            req.body,
        );
        const reporterType = req.user.roles.includes(UserRoleType.SELLER)
            ? FraudReporterType.SELLER
            : FraudReporterType.USER;
        const result = await this._createFraudReportUsecase.execute({
            reportedUserId: req.user.id,
            targetedUserId: body.targetedUserId,
            reporterType,
            source: FraudReportSource.MANUAL,
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

    createSystemReport = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const body =
                ValidationHelper.validate<ZodCreateFraudReportInputType>(
                    createFraudReportSchema,
                    req.body,
                );
            const result = await this._createFraudReportUsecase.execute({
                reportedUserId: req.user?.id ?? 'SYSTEM',
                targetedUserId: body.targetedUserId,
                reporterType: FraudReporterType.SYSTEM,
                source: FraudReportSource.SYSTEM,
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
        },
    );

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

    updateReport = expressAsyncHandler(async (req: Request, res: Response) => {
        const body = ValidationHelper.validate<ZodUpdateFraudReportInputType>(
            updateFraudReportSchema,
            { ...req.body, reportId: req.params.id as string },
        );
        const result = await this._updateFraudReportUsecase.execute({
            reportId: body.reportId,
            category: body.category as FraudReportCategory | undefined,
            status: body.status as FraudReportStatus | undefined,
            decision:
                (body.decision as FraudAdminDecision | null | undefined) ??
                undefined,
            reporterType: body.reporterType as FraudReporterType | undefined,
            source: body.source as FraudReportSource | undefined,
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

    getSuspensionTimeline = expressAsyncHandler(
        async (req: Request, res: Response) => {
            const params =
                ValidationHelper.validate<ZodGetSuspensionTimelineInputType>(
                    getSuspensionTimelineSchema,
                    { userId: req.params.userId as string },
                );
            const result = await this._getSuspensionTimelineUsecase.execute(
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

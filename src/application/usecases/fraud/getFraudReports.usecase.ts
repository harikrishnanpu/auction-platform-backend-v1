import {
    IGetFraudReportsInputDto,
    IGetFraudReportsOutputDto,
} from '@application/dtos/fraud/fraud-report.dto';
import { IGetFraudReportsUsecase } from '@application/interfaces/usecases/fraud/IGetFraudReportsUsecase';
import { TYPES } from '@di/types.di';
import { IFraudReportRepository } from '@domain/repositories/IFraudReportRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetFraudReportsUsecase implements IGetFraudReportsUsecase {
    constructor(
        @inject(TYPES.IFraudReportRepository)
        private readonly _fraudRepository: IFraudReportRepository,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
    ) {}

    async execute(
        input: IGetFraudReportsInputDto,
    ): Promise<Result<IGetFraudReportsOutputDto>> {
        const result = await this._fraudRepository.findAll({
            page: input.page,
            limit: input.limit,
            search: input.search,
            status: input.status,
            sort: input.sort,
            order: input.order,
        });

        if (result.isFailure) return Result.fail(result.getError());

        const value = result.getValue();

        const userIds = Array.from(
            new Set(
                value.flatMap((report) => [
                    report.getReportedUserId(),
                    report.getTargetedUserId(),
                ]),
            ),
        );

        const usersResult = await this._userRepository.findManyByIds(userIds);
        if (usersResult.isFailure) return Result.fail(usersResult.getError());
        const userNameById = new Map(
            usersResult
                .getValue()
                .map((user) => [user.getId(), user.getName()]),
        );
        return Result.ok({
            reports: value.map((report) => ({
                id: report.getId(),
                reportedUserId: report.getReportedUserId(),
                reportedUserName:
                    userNameById.get(report.getReportedUserId()) ?? null,
                targetedUserId: report.getTargetedUserId(),
                targetedUserName:
                    userNameById.get(report.getTargetedUserId()) ?? null,
                reporterType: report.getReporterType(),
                source: report.getSource(),
                category: report.getCategory(),
                level: report.getLevel(),
                reason: report.getReason(),
                status: report.getStatus(),
                adminDecision: report.getAdminDecision(),
                reviewedById: report.getReviewedById(),
                reviewedAt: report.getReviewedAt(),
                createdAt: report.getCreatedAt(),
            })),
            page: input.page,
            limit: input.limit,
            total: value.length,
            totalPages: Math.max(1, Math.ceil(value.length / input.limit)),
        });
    }
}

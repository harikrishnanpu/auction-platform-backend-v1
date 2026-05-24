import {
    IGetFraudReportsInputDto,
    IGetFraudReportsOutputDto,
} from '@application/dtos/fraud/fraud-report.dto';
import { IGetFraudReportsUsecase } from '@application/interfaces/usecases/fraud/IGetFraudReportsUsecase';
import { TYPES } from '@di/types.di';
import { IFraudReportRepository } from '@domain/repositories/IFraudReportRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetFraudReportsUsecase implements IGetFraudReportsUsecase {
    constructor(
        @inject(TYPES.IFraudReportRepository)
        private readonly _fraudRepository: IFraudReportRepository,
    ) {}

    async execute(
        input: IGetFraudReportsInputDto,
    ): Promise<Result<IGetFraudReportsOutputDto>> {
        const filters = {
            page: input.page,
            limit: input.limit,
            search: input.search,
            status: input.status,
            sort: input.sort,
            order: input.order,
        };

        const [result, countResult] = await Promise.all([
            this._fraudRepository.findAll(filters),
            this._fraudRepository.count(filters),
        ]);

        if (result.isFailure) return Result.fail(result.getError());
        if (countResult.isFailure) return Result.fail(countResult.getError());

        const rawReports = result.getValue();
        const total = countResult.getValue();

        return Result.ok({
            reports: rawReports.map((report) => ({
                id: report.getId(),
                reportedUserId: report.getReportedUserId(),
                reportedUserName: report.getReportedUser()?.getName() ?? null,
                targetedUserId: report.getTargetedUserId(),
                targetedUserName: report.getTargetedUser()?.getName() ?? null,
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
            total,
            totalPages: Math.max(1, Math.ceil(total / input.limit)),
        });
    }
}

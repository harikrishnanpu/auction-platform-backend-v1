import {
    ICreateFraudReportInputDto,
    IFraudReportOutputDto,
} from '@application/dtos/fraud/fraud-report.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ICreateFraudReportUsecase } from '@application/interfaces/usecases/fraud/ICreateFraudReportUsecase';
import { TYPES } from '@di/types.di';
import {
    FraudReport,
    FraudReporterType,
} from '@domain/entities/fraud/fraud-report.entity';
import { UserStatus } from '@domain/entities/user/user.entity';
import { IFraudReportRepository } from '@domain/repositories/IFraudReportRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class CreateFraudReportUsecase implements ICreateFraudReportUsecase {
    constructor(
        @inject(TYPES.IFraudReportRepository)
        private readonly _fraudRepository: IFraudReportRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
    ) {}

    async execute(
        input: ICreateFraudReportInputDto,
    ): Promise<Result<IFraudReportOutputDto>> {
        const reportedUserResult = await this._userRepository.findById(
            input.reportedUserId,
        );
        if (reportedUserResult.isFailure)
            return Result.fail(reportedUserResult.getError());
        const targetedUserResult = await this._userRepository.findById(
            input.targetedUserId,
        );
        if (targetedUserResult.isFailure)
            return Result.fail(targetedUserResult.getError());

        const reportResult = FraudReport.create({
            id: this._idGeneratingService.generateId(),
            reportedUserId: input.reportedUserId,
            targetedUserId: input.targetedUserId,
            reporterType: input.reportedUserType,
            source: input.source,
            category: input.category,
            level: input.level,
            reason: input.reason,
            reportedUser: reportedUserResult.getValue(),
            targetedUser: targetedUserResult.getValue(),
            reviewedBy: null,
        });

        if (reportResult.isFailure) return Result.fail(reportResult.getError());

        const saveResult = await this._fraudRepository.save(
            reportResult.getValue(),
        );

        const previousReportsResult =
            await this._fraudRepository.findAllTodayReportsByTragetedUserId(
                targetedUserResult.getValue().getId(),
            );

        const previousReports = previousReportsResult.getValue();

        const totalSellerReports = previousReports.filter((report) => {
            if (report.getReporterType() === FraudReporterType.SELLER) {
                return report;
            }
        });

        const totalUserReports = previousReports.filter((report) => {
            if (report.getReporterType() === FraudReporterType.USER) {
                return report;
            }
        });

        if (saveResult.isFailure) return Result.fail(saveResult.getError());

        const isSuspentionNeeeded =
            totalSellerReports.length === 3 && totalUserReports.length === 3;

        const targetUser = targetedUserResult.getValue();
        if (isSuspentionNeeeded) {
            targetUser.setStatus(UserStatus.SUSPENDED);
            await this._userRepository.save(targetUser);
        }

        const report = saveResult.getValue();

        return Result.ok({
            id: report.getId(),
            reportedUserId: report.getReportedUserId(),
            targetedUserId: report.getTargetedUserId(),
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
        });
    }
}

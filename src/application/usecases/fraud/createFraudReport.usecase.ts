import {
    ICreateFraudReportInputDto,
    IFraudReportOutputDto,
} from '@application/dtos/fraud/fraud-report.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import { ICreateFraudReportUsecase } from '@application/interfaces/usecases/fraud/ICreateFraudReportUsecase';
import { TYPES } from '@di/types.di';
import {
    FraudReport,
    FraudReporterType,
} from '@domain/entities/fraud/fraud-report.entity';
import {
    SuspensionType,
    UserSuspension,
} from '@domain/entities/fraud/user-suspension.entity';
import { UserRoleType } from '@application/dtos/auth/userRole.dto';
import { User, UserStatus } from '@domain/entities/user/user.entity';
import { IFraudReportRepository } from '@domain/repositories/IFraudReportRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IUserSuspensionRepository } from '@domain/repositories/IUserSuspensionRepository';
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
        @inject(TYPES.IUserSuspensionRepository)
        private readonly _suspensionRepository: IUserSuspensionRepository,
        @inject(TYPES.ISystemConfigService)
        private readonly _systemConfigService: ISystemConfigService,
    ) {}

    async execute(
        input: ICreateFraudReportInputDto,
    ): Promise<Result<IFraudReportOutputDto>> {
        if (input.reportedUserId === input.targetedUserId) {
            return Result.fail('report failed : self');
        }

        const reportedUserResult = await this._userRepository.findById(
            input.reportedUserId,
        );
        if (reportedUserResult.isFailure) {
            return Result.fail(reportedUserResult.getError());
        }

        const targetedUserResult = await this._userRepository.findById(
            input.targetedUserId,
        );
        if (targetedUserResult.isFailure) {
            return Result.fail(targetedUserResult.getError());
        }

        const reporter = reportedUserResult.getValue();
        const reporterRoles = reporter
            .getRoles()
            .map((role) => role.getValue());

        if (
            input.reportedUserType === FraudReporterType.SELLER &&
            !reporterRoles.includes(UserRoleType.SELLER)
        ) {
            return Result.fail('Only sellers can file:  seller report');
        }

        const reportResult = FraudReport.create({
            id: this._idGeneratingService.generateId(),
            reportedUserId: input.reportedUserId,
            targetedUserId: input.targetedUserId,
            reporterType: input.reportedUserType,
            source: input.source,
            category: input.category,
            level: input.level,
            reason: input.reason,
            reportedUser: reporter,
            targetedUser: targetedUserResult.getValue(),
            reviewedBy: null,
        });

        if (reportResult.isFailure) return Result.fail(reportResult.getError());

        const saveResult = await this._fraudRepository.save(
            reportResult.getValue(),
        );
        if (saveResult.isFailure) return Result.fail(saveResult.getError());

        const previousReportsResult =
            await this._fraudRepository.findAllTodayReportsByTragetedUserId(
                targetedUserResult.getValue().getId(),
            );
        if (previousReportsResult.isFailure) {
            return Result.fail(previousReportsResult.getError());
        }

        const previousReports = previousReportsResult.getValue();
        const sellerReportCount = previousReports.filter(
            (report) => report.getReporterType() === FraudReporterType.SELLER,
        ).length;
        const userReportCount = previousReports.filter(
            (report) => report.getReporterType() === FraudReporterType.USER,
        ).length;

        const thresholdResult =
            await this._systemConfigService.getFraudSuspensionThreshold();
        if (thresholdResult.isFailure) {
            return Result.fail(thresholdResult.getError());
        }
        const reportThreshold = thresholdResult.getValue();

        const shouldAutoSuspend =
            sellerReportCount >= reportThreshold &&
            userReportCount >= reportThreshold;

        if (shouldAutoSuspend) {
            const suspendResult = await this.applyAutoSuspension(
                targetedUserResult.getValue(),
                saveResult.getValue().getId(),
                reportThreshold,
            );
            if (suspendResult.isFailure) {
                return Result.fail(suspendResult.getError());
            }
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

    private async applyAutoSuspension(
        targetedUser: User,
        reportId: string,
        reportThreshold: number,
    ): Promise<Result<void>> {
        if (targetedUser.getStatus() === UserStatus.SUSPENDED) {
            return Result.ok();
        }

        const durationResult =
            await this._systemConfigService.getFraudTemporarySuspensionDurationMs();
        if (durationResult.isFailure) {
            return Result.fail(durationResult.getError());
        }

        const startsAt = new Date();
        const endsAt = new Date(startsAt.getTime() + durationResult.getValue());

        const suspensionResult = UserSuspension.create({
            id: this._idGeneratingService.generateId(),
            userId: targetedUser.getId(),
            reportId,
            type: SuspensionType.TEMPORARY,
            reason: `Auto suspension: ${reportThreshold}+ user and seller reports today`,
            startsAt,
            endsAt,
            isActive: true,
        });
        if (suspensionResult.isFailure) {
            return Result.fail(suspensionResult.getError());
        }

        const saveSuspensionResult = await this._suspensionRepository.create(
            suspensionResult.getValue(),
        );
        if (saveSuspensionResult.isFailure) {
            return Result.fail(saveSuspensionResult.getError());
        }

        targetedUser.suspend();
        const saveUserResult = await this._userRepository.save(targetedUser);
        if (saveUserResult.isFailure) {
            return Result.fail(saveUserResult.getError());
        }

        return Result.ok();
    }
}

import { IReviewFraudReportInputDto } from '@application/dtos/fraud/fraud-report.dto';
import { IReviewFraudReportUsecase } from '@application/interfaces/usecases/fraud/IReviewFraudReportUsecase';
import { TYPES } from '@di/types.di';
import {
    FraudAdminDecision,
    FraudReportStatus,
    FraudReportLevel,
} from '@domain/entities/fraud/fraud-report.entity';
import {
    SuspensionType,
    UserSuspension,
} from '@domain/entities/fraud/user-suspension.entity';
import { Notification } from '@domain/entities/notifications/notification.entity';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { IFraudReportRepository } from '@domain/repositories/IFraudReportRepository';
import { IUserSuspensionRepository } from '@domain/repositories/IUserSuspensionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';
import { randomUUID } from 'crypto';

@injectable()
export class ReviewFraudReportUsecase implements IReviewFraudReportUsecase {
    constructor(
        @inject(TYPES.IFraudReportRepository)
        private readonly _fraudRepository: IFraudReportRepository,
        @inject(TYPES.IUserSuspensionRepository)
        private readonly _suspensionRepository: IUserSuspensionRepository,
        @inject(TYPES.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
    ) {}

    async execute(input: IReviewFraudReportInputDto): Promise<Result<null>> {
        const reportResult = await this._fraudRepository.findById(
            input.reportId,
        );
        if (reportResult.isFailure) return Result.fail(reportResult.getError());
        const report = reportResult.getValue();

        const updateResult = await this._fraudRepository.updateReview({
            reportId: input.reportId,
            reviewedById: input.adminUserId,
            decision: input.decision,
            status: FraudReportStatus.RESOLVED,
        });
        if (updateResult.isFailure) return Result.fail(updateResult.getError());

        if (input.decision !== FraudAdminDecision.FAULT_VERIFIED) {
            return Result.ok(null);
        }

        const points =
            report.getLevel() === FraudReportLevel.CRITICAL
                ? 3
                : report.getLevel() === FraudReportLevel.MEDIUM
                  ? 2
                  : 1;
        const userFraudLevelResult =
            await this._suspensionRepository.incrementUserFraudLevel(
                report.getTargetedUserId(),
                points,
            );
        if (userFraudLevelResult.isFailure) {
            return Result.fail(userFraudLevelResult.getError());
        }

        const criticalCountResult =
            await this._fraudRepository.countByUserAndLevel(
                report.getTargetedUserId(),
                FraudReportLevel.CRITICAL,
            );
        if (criticalCountResult.isFailure) {
            return Result.fail(criticalCountResult.getError());
        }
        const mediumCountResult =
            await this._fraudRepository.countByUserAndLevel(
                report.getTargetedUserId(),
                FraudReportLevel.MEDIUM,
            );
        if (mediumCountResult.isFailure) {
            return Result.fail(mediumCountResult.getError());
        }
        const shouldSuspend =
            userFraudLevelResult.getValue() >= 3 ||
            criticalCountResult.getValue() >= 1 ||
            mediumCountResult.getValue() >= 2;

        const notificationResult = Notification.create({
            id: randomUUID(),
            userId: report.getTargetedUserId(),
            title: 'Fraud report decision',
            message:
                'Admin verified a fault against your account. Please review your account activity.',
        });
        if (notificationResult.isFailure) {
            return Result.fail(notificationResult.getError());
        }
        const saveNotificationResult = await this._notificationRepository.save(
            notificationResult.getValue(),
        );
        if (saveNotificationResult.isFailure) {
            return Result.fail(saveNotificationResult.getError());
        }

        if (!shouldSuspend) return Result.ok(null);

        const previousSuspensionsResult =
            await this._suspensionRepository.findSuspensionTimeline(
                report.getTargetedUserId(),
            );
        if (previousSuspensionsResult.isFailure) {
            return Result.fail(previousSuspensionsResult.getError());
        }
        const hadPreviousSuspension =
            previousSuspensionsResult.getValue().length > 0;

        const type = hadPreviousSuspension
            ? SuspensionType.PERMANENT
            : SuspensionType.TEMPORARY;
        const startsAt = new Date();
        const endsAt = hadPreviousSuspension
            ? null
            : new Date(startsAt.getTime() + 7 * 24 * 60 * 60 * 1000);

        const suspensionResult = UserSuspension.create({
            id: randomUUID(),
            userId: report.getTargetedUserId(),
            reportId: report.getId(),
            type,
            reason: `Auto suspension after verified fraud report ${report.getId()}`,
            startsAt,
            endsAt,
            isActive: true,
        });
        if (suspensionResult.isFailure) {
            return Result.fail(suspensionResult.getError());
        }

        const saveSuspensionResult =
            await this._suspensionRepository.createSuspension(
                suspensionResult.getValue(),
            );
        if (saveSuspensionResult.isFailure) {
            return Result.fail(saveSuspensionResult.getError());
        }

        const setSuspendedResult =
            await this._suspensionRepository.markUserSuspended(
                report.getTargetedUserId(),
            );
        if (setSuspendedResult.isFailure) {
            return Result.fail(setSuspendedResult.getError());
        }

        return Result.ok(null);
    }
}

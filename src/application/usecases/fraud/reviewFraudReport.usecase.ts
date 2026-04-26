import { IReviewFraudReportInputDto } from '@application/dtos/fraud/fraud-report.dto';
import { IReviewFraudReportUsecase } from '@application/interfaces/usecases/fraud/IReviewFraudReportUsecase';
import { TYPES } from '@di/types.di';
import {
    FraudAdminDecision,
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
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { USER_SUSPENSION_CONSTANTS } from '@domain/constants/userSuspension.constants';

@injectable()
export class ReviewFraudReportUsecase implements IReviewFraudReportUsecase {
    constructor(
        @inject(TYPES.IFraudReportRepository)
        private readonly _fraudRepository: IFraudReportRepository,
        @inject(TYPES.IUserSuspensionRepository)
        private readonly _suspensionRepository: IUserSuspensionRepository,
        @inject(TYPES.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
    ) {}

    async execute(input: IReviewFraudReportInputDto): Promise<Result<null>> {
        const reportResult = await this._fraudRepository.findById(
            input.reportId,
        );
        if (reportResult.isFailure) return Result.fail(reportResult.getError());
        const report = reportResult.getValue();

        if (!report) {
            return Result.fail('Fraud report not found');
        }

        report.resolve(input.adminUserId, input.decision);
        const updateResult = await this._fraudRepository.updateReport(report);
        if (updateResult.isFailure) {
            return Result.fail(updateResult.getError());
        }

        if (input.decision !== FraudAdminDecision.FAULT_VERIFIED) {
            return Result.ok(null);
        }

        const points =
            report.getLevel() === FraudReportLevel.CRITICAL
                ? 3
                : report.getLevel() === FraudReportLevel.MEDIUM
                  ? 2
                  : 1;

        const targetedUserResult = await this._userRepository.findById(
            report.getTargetedUserId(),
        );

        if (targetedUserResult.isFailure) {
            return Result.fail(targetedUserResult.getError());
        }
        const targetedUser = targetedUserResult.getValue();

        targetedUser.setUserFraudLevel(
            targetedUser.getUserFraudLevel() + points,
        );
        const saveTargetedUserResult =
            await this._userRepository.save(targetedUser);
        if (saveTargetedUserResult.isFailure) {
            return Result.fail(saveTargetedUserResult.getError());
        }
        const shouldSuspend =
            targetedUser.getUserFraudLevel() >=
            USER_SUSPENSION_CONSTANTS.SUSPENSION_THRESHOLD;

        const notificationResult = Notification.create({
            id: this._idGeneratingService.generateId(),
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
            await this._suspensionRepository.findUserSuspensions(
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
            : new Date(
                  startsAt.getTime() +
                      USER_SUSPENSION_CONSTANTS.TEMPORARY_SUSPENSION_DURATION,
              );

        const suspensionResult = UserSuspension.create({
            id: this._idGeneratingService.generateId(),
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

        const saveSuspensionResult = await this._suspensionRepository.create(
            suspensionResult.getValue(),
        );
        if (saveSuspensionResult.isFailure) {
            return Result.fail(saveSuspensionResult.getError());
        }

        targetedUser.suspend();
        const saveSuspendedUserResult =
            await this._userRepository.save(targetedUser);
        if (saveSuspendedUserResult.isFailure) {
            return Result.fail(saveSuspendedUserResult.getError());
        }

        return Result.ok(null);
    }
}

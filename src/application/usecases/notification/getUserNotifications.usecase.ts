import { IUserNotificationDto } from '@application/dtos/notification/notification.dto';
import { IGetUserNotificationsUsecase } from '@application/interfaces/usecases/notification/IGetUserNotificationsUsecase';
import { TYPES } from '@di/types.di';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetUserNotificationsUsecase implements IGetUserNotificationsUsecase {
    constructor(
        @inject(TYPES.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
    ) {}

    async execute(userId: string): Promise<Result<IUserNotificationDto[]>> {
        const notificationsResult =
            await this._notificationRepository.findAllByUserId(userId);

        if (notificationsResult.isFailure) {
            return Result.fail(notificationsResult.getError());
        }

        const notifications = notificationsResult
            .getValue()
            .map((notification) => ({
                id: notification.getId(),
                title: notification.getTitle(),
                message: notification.getMessage(),
                isRead: notification.getIsRead(),
            }));

        return Result.ok(notifications);
    }
}

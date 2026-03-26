import { Notification } from '@domain/entities/notifications/notification.entity';
import { Result } from '@domain/shared/result';
import {
    IFindNotificationsOptions,
    IFindNotificationsResult,
} from '@domain/types/notifications.type';

export interface INotificationRepository {
    save(notification: Notification): Promise<Result<Notification>>;
    findAllByUserId(
        userId: string,
        options?: IFindNotificationsOptions,
    ): Promise<Result<IFindNotificationsResult>>;
}

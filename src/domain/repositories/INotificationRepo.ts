import { Notification } from '@domain/entities/notifications/notification.entity';
import { Result } from '@domain/shared/result';

export interface INotificationRepository {
    save(notification: Notification): Promise<Result<Notification>>;
    findAllByUserId(userId: string): Promise<Result<Notification[]>>;
}

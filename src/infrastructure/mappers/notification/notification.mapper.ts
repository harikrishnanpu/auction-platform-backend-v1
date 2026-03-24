import { Notification } from '@domain/entities/notifications/notification.entity';
import { Result } from '@domain/shared/result';
import { Notification as PrismaNotification } from '@prisma/client';

export class NotificationMapper {
    static toDomain(notification: PrismaNotification): Result<Notification> {
        return Notification.create({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            userId: notification.userId,
            isRead: notification.isRead,
            isDelivered: notification.isDelivered,
        });
    }
}

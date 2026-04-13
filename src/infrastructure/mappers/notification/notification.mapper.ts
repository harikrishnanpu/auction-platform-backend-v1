import { Notification } from '@domain/entities/notifications/notification.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { Notification as PrismaNotification } from '@prisma/client';

export class NotificationMapper implements IDbMapper<
    Notification,
    PrismaNotification
> {
    toDomain(notification: PrismaNotification): Result<Notification> {
        const notificationEntity = Notification.create({
            id: notification.id,
            title: notification.title,
            message: notification.message,
            userId: notification.userId,
            isRead: notification.isRead,
            isDelivered: notification.isDelivered,
        });

        if (notificationEntity.isFailure)
            return Result.fail(notificationEntity.getError());

        return Result.ok(notificationEntity.getValue());
    }

    toPersistence(notification: Notification): unknown {
        return {
            id: notification.getId(),
            title: notification.getTitle(),
            message: notification.getMessage(),
            userId: notification.getUserId(),
            isRead: notification.getIsRead(),
            isDelivered: notification.getIsDelivered(),
        };
    }
}

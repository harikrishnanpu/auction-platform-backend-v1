import { TYPES } from '@di/types.di';
import { Notification } from '@domain/entities/notifications/notification.entity';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { Result } from '@domain/shared/result';
import { NotificationMapper } from '@infrastructure/mappers/notification/notification.mapper';
import { PrismaClient } from '@prisma/client';
import { inject } from 'inversify';

export class PrismaNotificationRepo implements INotificationRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
    ) {}

    async save(notification: Notification): Promise<Result<Notification>> {
        const res = await this._prisma.notification.create({
            data: {
                id: notification.getId(),
                title: notification.getTitle(),
                message: notification.getMessage(),
                userId: notification.getUserId(),
                isRead: notification.getIsRead(),
                isDelivered: notification.getIsDelivered(),
            },
        });

        return NotificationMapper.toDomain(res);
    }

    async findAllByUserId(userId: string): Promise<Result<Notification[]>> {
        const res = await this._prisma.notification.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (res.length === 0) return Result.ok([]);

        const notifications: Notification[] = [];

        for (const not of res) {
            const result = NotificationMapper.toDomain(not);
            if (result.isFailure) return Result.fail(result.getError());
            notifications.push(result.getValue());
        }

        return Result.ok(notifications);
    }
}

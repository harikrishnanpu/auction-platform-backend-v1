import { TYPES } from '@di/types.di';
import { Notification } from '@domain/entities/notifications/notification.entity';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { Result } from '@domain/shared/result';
import { IFindNotificationsOptions } from '@domain/types/notifications.type';
import { PrismaClient } from '@prisma/client';
import { inject } from 'inversify';
import { BaseRepository } from '../base/base.Repo';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Notification as PrismaNotification } from '@prisma/client';

export class PrismaNotificationRepo
    extends BaseRepository<
        Notification,
        PrismaNotification,
        { id: string },
        IDbMapper<Notification, PrismaNotification>
    >
    implements INotificationRepository
{
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
        @inject(TYPES.NotificationMapper)
        readonly mapper: IDbMapper<Notification, PrismaNotification>,
    ) {
        super(_prisma.notification, mapper);
    }

    async findAllByUserId(
        userId: string,
        options?: IFindNotificationsOptions,
    ): Promise<Result<{ items: Notification[]; total: number }>> {
        const page =
            options?.page && options.page > 0 ? Math.floor(options.page) : 1;
        const limit =
            options?.limit && options.limit > 0
                ? Math.floor(options.limit)
                : 10;
        const skip = (page - 1) * limit;

        const [res, total] = await Promise.all([
            this._prisma.notification.findMany({
                where: {
                    userId: userId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this._prisma.notification.count({
                where: {
                    userId: userId,
                },
            }),
        ]);

        if (res.length === 0) return Result.ok({ items: [], total });

        const notifications: Notification[] = [];

        for (const not of res) {
            const result = this.mapper.toDomain(not);
            // --change
            if (result.isFailure) return Result.fail(result.getError());
            notifications.push(result.getValue());
        }

        return Result.ok({ items: notifications, total });
    }
}

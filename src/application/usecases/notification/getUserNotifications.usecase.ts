import {
    IGetUserNotificationsInputDto,
    IGetUserNotificationsOutputDto,
    INotificationStreamDto,
} from '@application/dtos/notification/notification.dto';
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

    async execute(
        input: IGetUserNotificationsInputDto,
    ): Promise<Result<IGetUserNotificationsOutputDto>> {
        const page =
            Number.isFinite(input.page) && input.page > 0
                ? Math.floor(input.page)
                : 1;
        const limit =
            Number.isFinite(input.limit) && input.limit > 0
                ? Math.floor(input.limit)
                : 10;

        const notificationsResult =
            await this._notificationRepository.findAllByUserId(input.userId, {
                page,
                limit,
            });

        if (notificationsResult.isFailure) {
            return Result.fail(notificationsResult.getError());
        }

        const queryResult = notificationsResult.getValue();
        const items = queryResult.items.map((notification) => ({
            id: notification.getId(),
            title: notification.getTitle(),
            message: notification.getMessage(),
            isRead: notification.getIsRead(),
        }));

        const total = queryResult.total;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        return Result.ok({
            items,
            page,
            limit,
            total,
            totalPages,
        });
    }

    async getStreamPayload(
        userId: string,
    ): Promise<Result<INotificationStreamDto>> {
        const latestResult = await this._notificationRepository.findAllByUserId(
            userId,
            { page: 1, limit: 10 },
        );

        if (latestResult.isFailure) {
            return Result.fail(latestResult.getError());
        }

        const queryResult = latestResult.getValue();
        const items = queryResult.items.map((notification) => ({
            id: notification.getId(),
            title: notification.getTitle(),
            message: notification.getMessage(),
            isRead: notification.getIsRead(),
        }));

        return Result.ok({
            items,
            totalCount: queryResult.total,
        });
    }
}

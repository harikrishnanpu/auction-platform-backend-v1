import {
    IGetUserNotificationsInputDto,
    IGetUserNotificationsOutputDto,
    INotificationStreamDto,
} from '@application/dtos/notification/notification.dto';
import { Result } from '@domain/shared/result';

export interface IGetUserNotificationsUsecase {
    execute(
        input: IGetUserNotificationsInputDto,
    ): Promise<Result<IGetUserNotificationsOutputDto>>;
    getStreamPayload(userId: string): Promise<Result<INotificationStreamDto>>;
}

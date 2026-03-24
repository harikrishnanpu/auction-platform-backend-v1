import { IUserNotificationDto } from '@application/dtos/notification/notification.dto';
import { Result } from '@domain/shared/result';

export interface IGetUserNotificationsUsecase {
    execute(userId: string): Promise<Result<IUserNotificationDto[]>>;
}

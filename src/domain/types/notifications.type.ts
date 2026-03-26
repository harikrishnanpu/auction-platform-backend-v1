import { Notification } from '@domain/entities/notifications/notification.entity';

export interface IFindNotificationsOptions {
    page?: number;
    limit?: number;
}

export interface IFindNotificationsResult {
    items: Notification[];
    total: number;
}

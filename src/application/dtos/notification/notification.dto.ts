export interface ICreateNotificationInputDto {
    title: string;
    message: string;
    userId: string;
}

export interface IUserNotificationDto {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
}

export interface IGetUserNotificationsInputDto {
    userId: string;
    page: number;
    limit: number;
}

export interface IGetUserNotificationsOutputDto {
    items: IUserNotificationDto[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface INotificationStreamDto {
    items: IUserNotificationDto[];
    totalCount: number;
}

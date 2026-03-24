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

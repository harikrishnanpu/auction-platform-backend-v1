import { Result } from '@domain/shared/result';

export class Notification {
    constructor(
        private readonly id: string,
        private readonly title: string,
        private readonly message: string,
        private readonly userId: string,
        private readonly isRead: boolean,
        private readonly isDelivered: boolean,
    ) {}

    static create({
        id,
        title,
        message,
        userId,
        isRead = false,
        isDelivered = false,
    }: {
        id: string;
        title: string;
        message: string;
        userId: string;
        isRead?: boolean;
        isDelivered?: boolean;
    }): Result<Notification> {
        return Result.ok(
            new Notification(id, title, message, userId, isRead, isDelivered),
        );
    }

    getId(): string {
        return this.id;
    }

    getTitle(): string {
        return this.title;
    }

    getMessage(): string {
        return this.message;
    }

    getUserId(): string {
        return this.userId;
    }

    getIsRead(): boolean {
        return this.isRead;
    }

    getIsDelivered(): boolean {
        return this.isDelivered;
    }
}

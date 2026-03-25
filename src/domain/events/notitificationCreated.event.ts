import { IDomainEvent } from './IDomainevent';

export class NotificationCreated implements IDomainEvent {
    readonly eventName = 'NotificationCreated';

    constructor(
        public readonly notificationId: string,
        public readonly userId: string,
        public readonly title: string,
        public readonly message: string,
    ) {}
}

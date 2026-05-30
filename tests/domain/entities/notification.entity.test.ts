import { describe, expect, it } from 'vitest';
import { Notification } from '@domain/entities/notifications/notification.entity';

describe('Notification Domain Entity', () => {
    it('should successfully create a Notification entity', () => {
        const notifResult = Notification.create({
            id: 'not-1',
            title: 'Alert',
            message: 'New message',
            userId: 'user-123',
        });

        expect(notifResult.isSuccess).toBe(true);
        expect(notifResult.getValue().getId()).toBe('not-1');
        expect(notifResult.getValue().getTitle()).toBe('Alert');
        expect(notifResult.getValue().getMessage()).toBe('New message');
        expect(notifResult.getValue().getUserId()).toBe('user-123');
        expect(notifResult.getValue().getIsRead()).toBe(false);
        expect(notifResult.getValue().getIsDelivered()).toBe(false);
    });

    it('should fail to create a Notification entity if the title is not provided', () => {
        const notifResult = Notification.create({
            id: 'not-1',
            title: '',
            message: 'New message',
            userId: 'user-123',
        });
        expect(notifResult.isSuccess).toBe(false);
        expect(notifResult.getError()).toBe(
            'Notification title cannot be empty',
        );
    });
});

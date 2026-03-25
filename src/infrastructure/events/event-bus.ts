import { IEventBus } from '@application/interfaces/events/IEventBus';
import { IDomainEvent } from '@domain/events/IDomainevent';

export class EventBus implements IEventBus {
    private readonly _handlers: Map<string, ((event: IDomainEvent) => void)[]> =
        new Map();

    subscribe(eventName: string, handler: (event: IDomainEvent) => void): void {
        console.log('Subscribing to event:', eventName);
        if (!this._handlers.has(eventName)) {
            this._handlers.set(eventName, []);
        }

        this._handlers.get(eventName)?.push(handler);
    }

    publish(event: IDomainEvent): void {
        console.log('Publishing event:', event.eventName);
        const handlers = this._handlers.get(event.eventName);

        console.log('Handlers:', handlers);

        if (handlers) {
            handlers.forEach((handler) => handler(event));
        } else {
            console.log('No handlers found for event:', event.eventName);
        }
    }
}

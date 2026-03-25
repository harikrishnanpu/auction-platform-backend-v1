import { IDomainEvent } from '@domain/events/IDomainevent';

export interface IEventBus {
    subscribe(eventName: string, handler: (event: IDomainEvent) => void): void;

    publish(event: IDomainEvent): void;
}

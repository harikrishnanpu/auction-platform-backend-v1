import { IDomainEvent } from './IDomainevent';

export class AuctionEnded implements IDomainEvent {
    readonly eventName = 'AuctionEnded';

    constructor(
        public readonly auctionId: string,
        public readonly auctionTitle: string,
        public readonly winnerId: string | null,
    ) {}
}

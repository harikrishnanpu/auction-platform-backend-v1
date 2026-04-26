import { Router } from 'mediasoup/node/lib/RouterTypes';
import { IAuctionRoom, IAuctionRoomUser } from 'socket/types/IAuctionRoom';
import { Producer } from 'mediasoup/node/lib/ProducerTypes';
import { Consumer } from 'mediasoup/node/lib/ConsumerTypes';
import { WebRtcTransport } from 'mediasoup/node/lib/WebRtcTransportTypes';

export class LiveAuctionRoomManager {
    private auctionRooms: Map<string, IAuctionRoom> = new Map();

    constructor() {
        this.auctionRooms = new Map();
    }

    public createAuctionRoom(roomId: string, router: Router): IAuctionRoom {
        const existing = this.auctionRooms.get(roomId);
        if (existing) {
            return existing;
        }

        const auctionRoom: IAuctionRoom = {
            roomId,
            router,
            users: new Map(),
        };
        this.auctionRooms.set(roomId, auctionRoom);
        return auctionRoom;
    }

    public getAuctionRoom(roomId: string): IAuctionRoom | undefined {
        return this.auctionRooms.get(roomId);
    }

    public joinAuctionRoom(roomId: string, user: IAuctionRoomUser): void {
        const auctionRoom = this.getAuctionRoom(roomId);
        if (auctionRoom && !auctionRoom.users.has(user.id)) {
            auctionRoom.users.set(user.id, user);
        }
    }

    public leaveAuctionRoom(roomId: string, userId: string): void {
        const auctionRoom = this.getAuctionRoom(roomId);
        if (!auctionRoom) {
            return;
        }

        const user = auctionRoom.users.get(userId);
        if (user) {
            user.producers.forEach((producer) => producer.close());
            user.consumers.forEach((consumer) => consumer.close());
            user.transport?.close();
            auctionRoom.users.delete(userId);
        }

        if (auctionRoom.users.size === 0) {
            this.auctionRooms.delete(roomId);
        }
    }

    public getProducers(roomId: string): Producer[] {
        const auctionRoom = this.getAuctionRoom(roomId);
        if (!auctionRoom) {
            return [];
        }

        const producers: Producer[] = [];
        auctionRoom.users.forEach((user) => {
            user.producers.forEach((producer) => producers.push(producer));
        });
        return producers;
    }

    public getUser(roomId: string, userId: string): IAuctionRoomUser | null {
        const room = this.getAuctionRoom(roomId);
        if (!room) {
            return null;
        }
        return room.users.get(userId) ?? null;
    }

    public setTransport(
        roomId: string,
        userId: string,
        transport: WebRtcTransport,
    ): boolean {
        const user = this.getUser(roomId, userId);
        if (!user) {
            return false;
        }
        user.transport = transport;
        return true;
    }

    public addProducer(
        roomId: string,
        userId: string,
        producer: Producer,
    ): boolean {
        const user = this.getUser(roomId, userId);
        if (!user) {
            console.log('user not found', roomId, userId);
            return false;
        }
        user.producers.push(producer);
        return true;
    }

    public addConsumer(
        roomId: string,
        userId: string,
        consumer: Consumer,
    ): boolean {
        const user = this.getUser(roomId, userId);
        if (!user) {
            return false;
        }
        user.consumers.push(consumer);
        return true;
    }

    public removeProducer(roomId: string, producerId: string): string | null {
        const room = this.getAuctionRoom(roomId);
        if (!room) {
            return null;
        }

        for (const [userId, user] of room.users.entries()) {
            const idx = user.producers.findIndex((p) => p.id === producerId);
            if (idx >= 0) {
                user.producers.splice(idx, 1);
                return userId;
            }
        }

        return null;
    }
}

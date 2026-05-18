import { Router } from 'mediasoup/node/lib/RouterTypes';
import {
    IAuctionRoom,
    IAuctionRoomUser,
    LiveTransportDirection,
} from 'socket/types/IAuctionRoom';
import { Producer } from 'mediasoup/node/lib/ProducerTypes';
import { Consumer } from 'mediasoup/node/lib/ConsumerTypes';
import { WebRtcTransport } from 'mediasoup/node/lib/WebRtcTransportTypes';

export class LiveAuctionRoomManager {
    private auctionRooms: Map<string, IAuctionRoom> = new Map();

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
        if (auctionRoom) {
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
            this.closeUserMedia(user);
            auctionRoom.users.delete(userId);
        }

        if (auctionRoom.users.size === 0) {
            this.disposeRoom(roomId);
        }
    }

    private closeUserMedia(user: IAuctionRoomUser): void {
        user.producers.forEach((producer) => producer.close());
        user.consumers.forEach((consumer) => consumer.close());
        user.sendTransport?.close();
        user.recvTransport?.close();
        user.producers = [];
        user.consumers = [];
        user.sendTransport = null;
        user.recvTransport = null;
    }

    private disposeRoom(roomId: string): void {
        const auctionRoom = this.auctionRooms.get(roomId);
        if (!auctionRoom) {
            return;
        }

        auctionRoom.router.close();
        this.auctionRooms.delete(roomId);
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
        direction: LiveTransportDirection,
        transport: WebRtcTransport,
    ): boolean {
        const user = this.getUser(roomId, userId);
        if (!user) {
            return false;
        }

        if (direction === 'send') {
            user.sendTransport?.close();
            user.sendTransport = transport;
        } else {
            user.recvTransport?.close();
            user.recvTransport = transport;
        }

        return true;
    }

    public getTransport(
        roomId: string,
        userId: string,
        direction: LiveTransportDirection,
    ): WebRtcTransport | null {
        const user = this.getUser(roomId, userId);
        if (!user) {
            return null;
        }

        return direction === 'send' ? user.sendTransport : user.recvTransport;
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

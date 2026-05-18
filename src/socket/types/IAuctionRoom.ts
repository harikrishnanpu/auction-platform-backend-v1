import { Router } from 'mediasoup/node/lib/RouterTypes';
import { Consumer } from 'mediasoup/node/lib/ConsumerTypes';
import { Producer } from 'mediasoup/node/lib/ProducerTypes';
import { WebRtcTransport } from 'mediasoup/node/lib/WebRtcTransportTypes';

export type LiveTransportDirection = 'send' | 'recv';

export interface IAuctionRoomUser {
    id: string;
    username: string;
    role: 'host' | 'viewer';
    isEnabledToSpeak: boolean;
    sendTransport: WebRtcTransport | null;
    recvTransport: WebRtcTransport | null;
    producers: Producer[];
    consumers: Consumer[];
}

export interface IAuctionRoom {
    roomId: string;
    router: Router;
    users: Map<string, IAuctionRoomUser>;
}

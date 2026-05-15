import { Worker } from 'mediasoup/node/lib/WorkerTypes';
import { Router } from 'mediasoup/node/lib/RouterTypes';
import * as mediasoup from 'mediasoup';

const MEDIA_CODECS = [
    { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
    { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 },
];

const TRANSPORT_OPTIONS: mediasoup.types.WebRtcTransportOptions = {
    listenInfos: [
        { protocol: 'udp', ip: '0.0.0.0', announcedAddress: '127.0.0.1' },
    ],
    enableUdp: true,
    enableTcp: true,
};

export class MediaSoupeManager {
    private static _instance: MediaSoupeManager;
    private _worker!: Worker;

    private constructor() {
        this.init();
    }

    public static getInstance(): MediaSoupeManager {
        if (!this._instance) {
            this._instance = new MediaSoupeManager();
        }
        return this._instance;
    }

    private async init(): Promise<void> {
        this._worker = await mediasoup.createWorker({ logLevel: 'warn' });
    }

    public get worker(): Worker {
        return this._worker;
    }

    async createRouter(): Promise<Router> {
        //
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this._worker.createRouter({ mediaCodecs: MEDIA_CODECS as any });
    }

    async createTransport(
        router: Router,
    ): Promise<mediasoup.types.WebRtcTransport> {
        return router.createWebRtcTransport(TRANSPORT_OPTIONS);
    }
}

import { Worker } from 'mediasoup/node/lib/WorkerTypes';
import { Router } from 'mediasoup/node/lib/RouterTypes';
import * as mediasoup from 'mediasoup';

const MEDIA_CODECS = [
    { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
    { kind: 'video', mimeType: 'video/H264', clockRate: 90000 },
];

function getAnnouncedAddress(): string {
    const ip =
        process.env.MEDIASOUP_ANNOUNCED_IP?.trim() ||
        process.env.SERVER_HOST?.trim();
    if (!ip) {
        console.log(
            'MEDIASOUP_ANNOUNCED_IP is not set; remote clients may get black video',
        );
        return '127.0.0.1';
    }
    return ip;
}

function buildTransportOptions(): mediasoup.types.WebRtcTransportOptions {
    const announcedAddress = getAnnouncedAddress();
    return {
        listenInfos: [
            {
                protocol: 'udp',
                ip: '0.0.0.0',
                announcedAddress,
            },
            {
                protocol: 'tcp',
                ip: '0.0.0.0',
                announcedAddress,
            },
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
    };
}

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
        return router.createWebRtcTransport(buildTransportOptions());
    }
}

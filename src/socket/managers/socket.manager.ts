import { SocketEvents } from '../constants/socket.events';
import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'node:http';
import { Container } from 'inversify';
import { createSocketAuthMiddleware } from '../middlewares/socket.auth.middleware';
import { ILogger } from '@application/interfaces/services/ILogger';
import { TYPES } from '@di/types.di';
import { AuctionHandler } from '../handler/auction.handler';
import { ChatAgentHandler } from '../handler/chatAgent.handler';
import { hanldeSocketCallback } from '../helpers/socket.ack';
import { LiveAuctionRoomManager } from './liveAuctionRoom.manager';
import { MediaSoupeManager } from './mediaSoupe.manager';

const FRONTEND_URL = process.env.FRONTEND_URL;

export class SocketManager {
    private static _instance: SocketManager | null = null;
    public static _ioInstance: SocketIOServer | null = null;

    private constructor(
        private readonly _io: SocketIOServer,
        private readonly _logger: ILogger,
        private readonly _container: Container,
        private readonly _liveAuctionRoomManager: LiveAuctionRoomManager,
        private readonly _mediasoupeManager: MediaSoupeManager,
    ) {
        this.init();
    }

    public static getInstance(
        httpServer: HttpServer,
        container: Container,
    ): SocketManager {
        if (!this._instance) {
            const io = new SocketIOServer(httpServer, {
                cors: {
                    origin: FRONTEND_URL,
                    credentials: true,
                    methods: ['GET', 'POST'],
                },
                transports: ['polling', 'websocket'],
                path: '/socket.io',
                pingTimeout: 60000,
                pingInterval: 25000,
            });

            this._ioInstance = io;

            const logger = container.get<ILogger>(TYPES.ILogger);

            io.use(createSocketAuthMiddleware(container));

            io.on('connection_error', (err) => {
                logger.error(`Socket.IO connection error: ${err}`);
            });

            const liveAuctionRoomManager = new LiveAuctionRoomManager();
            const mediasoupeManager = MediaSoupeManager.getInstance();
            this._instance = new SocketManager(
                io,
                logger,
                container,
                liveAuctionRoomManager,
                mediasoupeManager,
            );
        }
        return this._instance;
    }

    private init(): void {
        this._io.on(SocketEvents.CONNECTION, (socket) => {
            const auctionHandler = new AuctionHandler(
                this._io,
                socket,
                this._container,
                this._liveAuctionRoomManager,
                this._mediasoupeManager,
            );

            const chatAgentHandler = new ChatAgentHandler(
                socket,
                this._container,
            );

            socket.on(SocketEvents.JOIN, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    auctionHandler.handleJoin(payload),
                );
            });

            socket.on(SocketEvents.PLACE_BID, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    auctionHandler.handlePlaceBid(payload),
                );
            });

            socket.on(SocketEvents.SEND_CHAT, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    auctionHandler.handleSendChat(payload),
                );
            });

            socket.on(SocketEvents.ASK_AGENT, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    chatAgentHandler.handleAskAgent(payload),
                );
            });

            socket.on(SocketEvents.PAUSE, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    auctionHandler.handlePauseAuction(payload),
                );
            });

            socket.on(SocketEvents.RESUME, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    auctionHandler.handleResumeAuction(payload),
                );
            });

            socket.on(SocketEvents.END, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    auctionHandler.handleEndAuction(payload),
                );
            });

            socket.on(SocketEvents.FAIL_AUCTION, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    auctionHandler.handleFailAuction(payload),
                );
            });

            socket.on(
                SocketEvents.SEND_FALLBACK_PUBLIC_NOTIFICATION,
                (payload, cl) => {
                    hanldeSocketCallback(cl, () =>
                        auctionHandler.handleSendFallbackPublicNotification(
                            payload,
                        ),
                    );
                },
            );

            socket.on(
                SocketEvents.CREATE_PAYMENT_ORDER_FOR_PUBLIC_FALLBACK_AUCTION,
                (payload, cl) => {
                    hanldeSocketCallback(cl, () =>
                        auctionHandler.handleCreatePaymentOrderForPublicFallbackAuction(
                            payload,
                        ),
                    );
                },
            );

            socket.on(
                SocketEvents.VERIFY_PAYMENT_FOR_PUBLIC_FALLBACK_AUCTION,
                (payload, cl) => {
                    hanldeSocketCallback(cl, () =>
                        auctionHandler.handleVerifyPaymentForPublicFallbackAuction(
                            payload,
                        ),
                    );
                },
            );

            socket.on(
                SocketEvents.DECLINE_PAYMENT_FOR_PUBLIC_FALLBACK_AUCTION,
                (payload, cl) => {
                    hanldeSocketCallback(cl, () =>
                        auctionHandler.handleDeclinePaymentForPublicFallbackAuction(
                            payload,
                        ),
                    );
                },
            );

            socket.on(SocketEvents.ADD_AUCTION_PARTICIPANT, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    auctionHandler.handleAddAuctionParticipant(payload),
                );
            });

            socket.on(
                SocketEvents.LIVE_AUCTION_GET_CAPABILITIES,
                (payload, cl) => {
                    hanldeSocketCallback(cl, () =>
                        auctionHandler.handleLiveAuctionGetCapabilities(
                            payload,
                        ),
                    );
                },
            );

            socket.on(
                SocketEvents.LIVE_AUCTION_CREATE_TRANSPORT,
                (payload, cl) => {
                    hanldeSocketCallback(cl, () =>
                        auctionHandler.handleLiveAuctionCreateTransport(
                            payload,
                        ),
                    );
                },
            );

            socket.on(
                SocketEvents.LIVE_AUCTION_CONNECT_TRANSPORT,
                (payload, cl) => {
                    hanldeSocketCallback(cl, () =>
                        auctionHandler.handleLiveAuctionConnectTransport(
                            payload,
                        ),
                    );
                },
            );

            socket.on(SocketEvents.LIVE_AUCTION_PRODUCE, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    auctionHandler.handleLiveAuctionProduce(payload),
                );
            });

            socket.on(SocketEvents.LIVE_AUCTION_CONSUME, (payload, cl) => {
                hanldeSocketCallback(cl, () =>
                    auctionHandler.handleLiveAuctionConsume(payload),
                );
            });

            socket.on(
                SocketEvents.LIVE_AUCTION_RESUME_CONSUMER,
                (payload, cl) => {
                    hanldeSocketCallback(cl, () =>
                        auctionHandler.handleLiveAuctionResumeConsumer(payload),
                    );
                },
            );

            //diconnect - disconnecting
            socket.on('disconnecting', () => {
                auctionHandler.handleSocketDisconnect([
                    ...socket.rooms.values(),
                ]);
            });
        });
    }
}

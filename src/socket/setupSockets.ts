import type { ILogger } from '@application/interfaces/services/ILogger';
import { TYPES } from '@di/types.di';
import type { Server as HttpServer } from 'http';
import type { Container } from 'inversify';
import { Server as SocketIOServer } from 'socket.io';
import { hanldeSocketCallback } from './socket.ack';
import { createSocketAuthMiddleware } from './middlewares/socket.auth.middleware';
import { SocketEvents } from './constants/socket.events';
import { AuctionHandler } from './handler/auction.handler';

export function setupSockets(
    httpServer: HttpServer,
    container: Container,
): SocketIOServer {
    const FRONTEND_URL = process.env.FRONTEND_URL;

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

    const logger = container.get<ILogger>(TYPES.ILogger);

    io.use(createSocketAuthMiddleware(container));

    io.on('connection_error', (err) => {
        logger.error(
            `Socket.IO connection error: ${err instanceof Error ? err.message : String(err)}`,
        );
    });

    io.on(SocketEvents.CONNECTION, (socket) => {
        const auctionHandler = new AuctionHandler(io, socket, container);

        socket.on(SocketEvents.JOIN, (payload, cl) => {
            hanldeSocketCallback(cl, () => auctionHandler.handleJoin(payload));
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
    });

    return io;
}

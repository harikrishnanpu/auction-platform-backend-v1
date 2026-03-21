import type { ILogger } from '@application/interfaces/services/ILogger';
import { TYPES } from '@di/types.di';
import type { Server as HttpServer } from 'http';
import type { Container } from 'inversify';
import { Server as SocketIOServer } from 'socket.io';
import { AuctionHandler } from './handler/auction.handler';
import { runWithAck } from './socket.ack';
import { createSocketAuthMiddleware } from './middlewares/socket.auth.middleware';
import { SocketEvents } from './constants/socket.events';

export function setupSockets(
  httpServer: HttpServer,
  container: Container,
): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
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
    const handler = new AuctionHandler(io, socket, container);

    socket.on(SocketEvents.JOIN, (payload, ack) => {
      void runWithAck(ack, () => handler.handleJoin(payload));
    });

    socket.on(SocketEvents.PLACE_BID, (payload, ack) => {
      void runWithAck(ack, () => handler.handlePlaceBid(payload));
    });

    socket.on(SocketEvents.SEND_CHAT, (payload, ack) => {
      void runWithAck(ack, () => handler.handleSendChat(payload));
    });

    socket.on(SocketEvents.PAUSE, (payload, ack) => {
      void runWithAck(ack, () => handler.handlePauseAuction(payload));
    });

    socket.on(SocketEvents.RESUME, (payload, ack) => {
      void runWithAck(ack, () => handler.handleResumeAuction(payload));
    });

    socket.on(SocketEvents.END, (payload, ack) => {
      void runWithAck(ack, () => handler.handleEndAuction(payload));
    });
  });

  return io;
}

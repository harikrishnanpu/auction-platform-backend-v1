import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { IEndAuctionUsecase } from '@application/interfaces/usecases/auction/IEndAuctionUsecase';
import { IGetAuctionRoomUsecase } from '@application/interfaces/usecases/auction/IGetAuctionRoomUsecase';
import { IGetAuctionChatMessagesUsecase } from '@application/interfaces/usecases/auction/IGetAuctionChatMessagesUsecase';
import { IPauseAuctionUsecase } from '@application/interfaces/usecases/auction/IPauseAuctionUsecase';
import { IPlaceBidUsecase } from '@application/interfaces/usecases/auction/IPlaceBidUsecase';
import { IResumeAuctionUsecase } from '@application/interfaces/usecases/auction/IResumeAuctionUsecase';
import { ISendAuctionChatMessageUsecase } from '@application/interfaces/usecases/auction/ISendAuctionChatMessageUsecase';
import { AuthUser } from '@presentation/types/auth.user';
import { TYPES } from '@di/types.di';
import type { Container } from 'inversify';
import type { Server, Socket } from 'socket.io';
import type { SocketAckPayload } from '../socket.ack';
import { SocketEvents } from '../constants/socket.events';
import {
    auctionControlSocketSchema,
    auctionJoinSocketSchema,
    parseSocketPayload,
    placeBidSocketSchema,
    sendChatSocketSchema,
} from '../validators';
import { authorizeUser } from 'socket/utils/authorizeUser';
import { IFailAuctionUsecase } from '@application/interfaces/usecases/auction/IFailAuctionUsecase';
// import { ISendPublicFallbackPublicNotificationUsecase } from '@application/interfaces/usecases/auction/ISendPublicFallbackPublicNotificationUsecase';

export class AuctionHandler {
    constructor(
        private readonly io: Server,
        private readonly socket: Socket,
        private readonly container: Container,
    ) {}

    private authorizeUser(
        user: AuthUser,
        allowedRoles: UserRoleType[],
    ): SocketAckPayload | null {
        if (!allowedRoles.some((role) => user.roles.includes(role))) {
            return { success: false, error: 'Unauthorized' };
        }

        return null;
    }

    async handleJoin(payload: unknown): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(auctionJoinSocketSchema, payload);

        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId, mode } = parsed.data;
        const user = this.socket.data.user;

        const getAuctionRoomUsecase =
            this.container.get<IGetAuctionRoomUsecase>(
                TYPES.IGetAuctionRoomUsecase,
            );

        const getChatUsecase =
            this.container.get<IGetAuctionChatMessagesUsecase>(
                TYPES.IGetAuctionChatMessagesUsecase,
            );

        const roomResult = await getAuctionRoomUsecase.execute({
            userId: user.id,
            auctionId,
            mode,
        });

        if (roomResult.isFailure) {
            return { success: false, error: roomResult.getError() };
        }

        const chatResult = await getChatUsecase.execute({
            auctionId,
            limit: 50,
        });
        console.log('chatResult is', chatResult);
        if (chatResult.isFailure) {
            return { success: false, error: chatResult.getError() };
        }

        const roomId = `auction:${auctionId}`;
        await this.socket.join(roomId);

        const result = roomResult.getValue();
        const chatMessages = chatResult.getValue();

        this.socket.emit(SocketEvents.JOINED, { ...result, chatMessages });

        return { success: true, data: { auctionId } };
    }

    async handlePlaceBid(payload: unknown): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(placeBidSocketSchema, payload);

        if (!parsed.ok) {
            console.log('PLACE BID PAYLOAD: ', payload);
            return { success: false, error: parsed.error };
        }

        const { auctionId, amount } = parsed.data;
        const user = this.socket.data.user;

        const placeBidUsecase = this.container.get<IPlaceBidUsecase>(
            TYPES.IPlaceBidUsecase,
        );

        const result = await placeBidUsecase.execute({
            auctionId,
            userId: user.id,
            userName: user.name,
            amount,
        });

        if (result.isFailure) {
            console.log('result is failure', result.getError());
            return { success: false, error: result.getError() };
        }

        const out = result.getValue();
        const roomId = `auction:${auctionId}`;

        this.io.to(roomId).emit(SocketEvents.BID_PLACED, {
            id: out.id,
            auctionId: out.auctionId,
            userId: out.userId,
            amount: out.amount,
            createdAt: out.createdAt,
        });

        this.io.to(roomId).emit(SocketEvents.UPDATED, {
            auctionId: out.auctionId,
            endAt: out.endAt,
            extensionCount: out.extensionCount,
        });

        this.io
            .to(roomId)
            .emit(SocketEvents.PARTICIPANTS_UPDATED, out.participants);

        return { success: true, data: { bidId: out.id } };
    }

    async handleSendChat(payload: unknown): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(sendChatSocketSchema, payload);
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId, message } = parsed.data;
        const user = this.socket.data.user;

        const sendChat = this.container.get<ISendAuctionChatMessageUsecase>(
            TYPES.ISendAuctionChatMessageUsecase,
        );

        const result = await sendChat.execute({
            auctionId,
            userId: user.id,
            userName: user.name,
            message,
        });

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        const dto = result.getValue();
        const roomId = `auction:${auctionId}`;
        this.io.to(roomId).emit(SocketEvents.CHAT_MESSAGE, dto);

        return { success: true, data: { id: dto.id } };
    }

    async handlePauseAuction(payload: unknown): Promise<SocketAckPayload> {
        const user = this.socket.data.user;
        const denied = authorizeUser(user, [
            UserRoleType.SELLER,
            UserRoleType.ADMIN,
        ]);
        if (denied) return { success: false, error: denied.error };

        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId } = parsed.data;
        const isAdmin = user.roles.includes(UserRoleType.ADMIN);
        const pauseAuctionUsecase = this.container.get<IPauseAuctionUsecase>(
            TYPES.IPauseAuctionUsecase,
        );
        const result = await pauseAuctionUsecase.execute({
            auctionId,
            userId: user.id,
            isAdmin,
        });

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        const updated = result.getValue();
        const roomId = `auction:${auctionId}`;
        this.io.to(roomId).emit(SocketEvents.UPDATED, {
            auctionId: updated.id,
            status: updated.status,
        });

        return {
            success: true,
            data: { auctionId: updated.id, status: updated.status },
        };
    }

    async handleResumeAuction(payload: unknown): Promise<SocketAckPayload> {
        const user = this.socket.data.user;
        const denied = this.authorizeUser(user, [
            UserRoleType.SELLER,
            UserRoleType.ADMIN,
        ]);
        if (denied) return denied;

        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId } = parsed.data;
        const isAdmin = user.roles.includes(UserRoleType.ADMIN);
        const resume = this.container.get<IResumeAuctionUsecase>(
            TYPES.IResumeAuctionUsecase,
        );
        const result = await resume.execute({
            auctionId,
            userId: user.id,
            isAdmin,
        });

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        const updated = result.getValue();
        const roomId = `auction:${auctionId}`;
        this.io.to(roomId).emit(SocketEvents.UPDATED, {
            auctionId: updated.id,
            status: updated.status,
        });

        return {
            success: true,
            data: { auctionId: updated.id, status: updated.status },
        };
    }

    async handleEndAuction(payload: unknown): Promise<SocketAckPayload> {
        const user = this.socket.data.user;
        const denied = this.authorizeUser(user, [
            UserRoleType.SELLER,
            UserRoleType.ADMIN,
        ]);
        if (denied) return denied;

        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId } = parsed.data;
        const isAdmin = user.roles.includes(UserRoleType.ADMIN);
        const end = this.container.get<IEndAuctionUsecase>(
            TYPES.IEndAuctionUsecase,
        );
        const result = await end.execute({
            auctionId,
            userId: user.id,
            isAdmin,
        });

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        const updated = result.getValue();
        const roomId = `auction:${auctionId}`;
        this.io.to(roomId).emit(SocketEvents.UPDATED, {
            auctionId: updated.id,
            status: updated.status,
        });

        return {
            success: true,
            data: { auctionId: updated.id, status: updated.status },
        };
    }

    async handleFailAuction(payload: unknown): Promise<SocketAckPayload> {
        const user = this.socket.data.user;
        const denied = this.authorizeUser(user, [
            UserRoleType.SELLER,
            UserRoleType.ADMIN,
        ]);
        if (denied) return { success: false, error: denied.error };

        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId } = parsed.data;

        const failAuctionUsecase = this.container.get<IFailAuctionUsecase>(
            TYPES.IFailAuctionUsecase,
        );
        const result = await failAuctionUsecase.execute({
            auctionId,
            reason: 'Seller choose Fail Auction',
        });

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        const updated = result.getValue();
        const roomId = `auction:${auctionId}`;

        this.io.to(roomId).emit(SocketEvents.UPDATED, {
            auctionId: updated.auctionId,
            status: updated.status,
        });

        return {
            success: true,
            data: { auctionId: updated.auctionId, status: updated.status },
        };
    }

    async handleSendFallbackPublicNotification(
        payload: unknown,
    ): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);

        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId } = parsed.data;

        return { success: true, data: { auctionId } };
    }
}

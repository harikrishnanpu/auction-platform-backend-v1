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
import type { SocketAckPayload } from '../helpers/socket.ack';
import { SocketEvents } from '../constants/socket.events';
import {
    autoBidDisableSocketSchema,
    autoBidSetSocketSchema,
    auctionControlSocketSchema,
    auctionJoinSocketSchema,
    parseSocketPayload,
    placeBidSocketSchema,
    sendChatSocketSchema,
} from '../validators';
import { authorizeUser } from 'socket/utils/authorizeUser';
import { IFailAuctionUsecase } from '@application/interfaces/usecases/auction/IFailAuctionUsecase';
import { ISendPublicFallbackPublicNotificationUsecase } from '@application/interfaces/usecases/auction/ISendPublicFallbackPublicNotificationUsecase';
import { ICreatePaymentOrderForPublicFallbackAuctionUsecase } from '@application/interfaces/usecases/payments/ICreatePaymentOrderForPublicFallbackAuctionUsecase';
import { IVerifyFallbackPublicAuctionPaymentUsecase } from '@application/interfaces/usecases/payments/IVerifyFallbackPublicAuctionPaymentUsecase';
import { verifyFallbackAuctionPaymentSchema } from 'socket/validators/verifyFallbackAuctionPayment.schema';
import { IDeclinePublicFallbackAuctionUsecase } from '@application/interfaces/usecases/auction/IDeclinePublicFallbackAuctionUsecase';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { IFallbackAuctionParticipantsRepo } from '@domain/repositories/IFallbackAuctionParticipantsRepo';
import { PublicAuctionFallbackParticipantsStatus } from '@domain/entities/auction/public-auction-fallback-participants.entity';
import { IAddAuctionParticipantUsecase } from '@application/interfaces/usecases/auction/IAddAuctionParticipantUsecase';
import { ICreateAutoBidConfigUsecase } from '@application/interfaces/usecases/auction/ICreateAutoBidConfigUsecase';
import { IUpdateAutoBidConfigUsecase } from '@application/interfaces/usecases/auction/IUpdateAutoBidConfigUsecase';
import { IDisableAutoBidConfigUsecase } from '@application/interfaces/usecases/auction/IDisableAutoBidConfigUsecase';
import { IGetUserAutoBidConfigUsecase } from '@application/interfaces/usecases/auction/IGetUserAutoBidConfigUsecase';
import {
    AuctionStatus,
    AuctionType,
} from '@domain/entities/auction/auction.entity';
import { AuctionParticipantPaymentStatus } from '@domain/entities/auction/auction-participant.entity';
import { LiveAuctionRoomManager } from 'socket/managers/liveAuctionRoom.manager';
import { MediaSoupeManager } from 'socket/managers/mediaSoupe.manager';
import type { DtlsParameters } from 'mediasoup/node/lib/WebRtcTransportTypes';
import { z } from 'zod';

export class AuctionHandler {
    constructor(
        private readonly io: Server,
        private readonly socket: Socket,
        private readonly container: Container,
        private readonly _liveAuctionRoomManager: LiveAuctionRoomManager,
        private readonly _mediasoupeManager: MediaSoupeManager,
    ) {}

    private parseLiveRoomId(auctionId: string): string {
        return `auction:${auctionId}`;
    }

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

        const isProducer =
            result.auction.status === AuctionStatus.ACTIVE &&
            (user.roles.includes(UserRoleType.ADMIN) ||
                user.roles.includes(UserRoleType.SELLER));

        this.socket.emit(SocketEvents.JOINED, {
            ...result,
            chatMessages,
            isLiveAuction: result.auction.auctionType === AuctionType.LIVE,
            isProducer,
        });

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
        const bidsToEmit = out.placedBids.length
            ? out.placedBids
            : [
                  {
                      id: out.id,
                      auctionId: out.auctionId,
                      userId: out.userId,
                      amount: out.amount,
                      createdAt: out.createdAt,
                      endAt: out.endAt,
                      extensionCount: out.extensionCount,
                  },
              ];

        for (const bid of bidsToEmit) {
            this.io.to(roomId).emit(SocketEvents.BID_PLACED, {
                id: bid.id,
                auctionId: out.auctionId,
                userId: bid.userId,
                amount: bid.amount,
                createdAt: bid.createdAt,
            });
        }

        this.io.to(roomId).emit(SocketEvents.UPDATED, {
            auctionId: out.auctionId,
            endAt: out.endAt,
            extensionCount: out.extensionCount,
            nextBidMin: out.nextBidMin,
        });

        this.io
            .to(roomId)
            .emit(SocketEvents.PARTICIPANTS_UPDATED, out.participants);

        return {
            success: true,
            data: {
                bidId: out.id,
                placedBids: bidsToEmit,
                participants: out.participants,
                nextBidMin: out.nextBidMin,
                endAt: out.endAt,
                extensionCount: out.extensionCount,
            },
        };
    }

    async handleSetAutoBid(payload: unknown): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(autoBidSetSocketSchema, payload);
        if (!parsed.ok) return { success: false, error: parsed.error };

        const user = this.socket.data.user;
        const denied = authorizeUser(user, [UserRoleType.USER]);
        if (denied) return { success: false, error: denied.error };

        const { auctionId, strategy, maxBidAmount } = parsed.data;

        const auctionRepo = this.container.get<IAuctionRepository>(
            TYPES.IAuctionRepository,
        );
        const participantRepo =
            this.container.get<IAuctionParticipantRepository>(
                TYPES.IAuctionParticipantRepository,
            );
        const createAutoBidConfigUsecase =
            this.container.get<ICreateAutoBidConfigUsecase>(
                TYPES.ICreateAutoBidConfigUsecase,
            );
        const updateAutoBidConfigUsecase =
            this.container.get<IUpdateAutoBidConfigUsecase>(
                TYPES.IUpdateAutoBidConfigUsecase,
            );
        const getUserAutoBidConfigUsecase =
            this.container.get<IGetUserAutoBidConfigUsecase>(
                TYPES.IGetUserAutoBidConfigUsecase,
            );

        const auctionResult = await auctionRepo.findById(auctionId);
        if (auctionResult.isFailure) {
            return { success: false, error: auctionResult.getError() };
        }
        const auction = auctionResult.getValue();
        if (!auction) {
            return { success: false, error: 'Auction not found' };
        }
        if (auction.getStatus() !== AuctionStatus.ACTIVE) {
            return {
                success: false,
                error: 'Auto bid can be enabled only for active auctions',
            };
        }

        const participantsResult =
            await participantRepo.findByAuctionId(auctionId);
        if (participantsResult.isFailure) {
            return { success: false, error: participantsResult.getError() };
        }

        const currentUser = participantsResult
            .getValue()
            .find((p) => p.getUserId() === user.id);

        if (
            !currentUser ||
            currentUser.getIntialAmount() !==
                AuctionParticipantPaymentStatus.PAID
        ) {
            return {
                success: false,
                error: 'Join auction and lock participation amount first',
            };
        }

        const existingAutoBidResult = await getUserAutoBidConfigUsecase.execute(
            {
                auctionId,
                userId: user.id,
            },
        );
        if (existingAutoBidResult.isFailure) {
            return { success: false, error: existingAutoBidResult.getError() };
        }

        if (existingAutoBidResult.getValue()) {
            return this.handleUpdateAutoBid({
                auctionId,
                userId: user.id,
                strategy,
                maxBidAmount,
                updateAutoBidConfigUsecase,
            });
        }

        return this.handleCreateAutoBid({
            auctionId,
            userId: user.id,
            userName: user.name,
            strategy,
            maxBidAmount,
            createAutoBidConfigUsecase,
        });
    }

    private async handleCreateAutoBid(input: {
        auctionId: string;
        userId: string;
        userName: string;
        strategy: 'SLOW' | 'FASTER' | 'SNIPER';
        maxBidAmount: number;
        createAutoBidConfigUsecase: ICreateAutoBidConfigUsecase;
    }): Promise<SocketAckPayload> {
        const createResult = await input.createAutoBidConfigUsecase.execute({
            auctionId: input.auctionId,
            userId: input.userId,
            userName: input.userName,
            strategy: input.strategy,
            maxBidAmount: input.maxBidAmount,
        });
        if (createResult.isFailure) {
            return { success: false, error: createResult.getError() };
        }

        const config = createResult.getValue();
        this.socket.emit(SocketEvents.AUTO_BID_CONFIG_CREATED, {
            id: config.id,
            strategy: config.strategy,
            maxBidAmount: config.maxBidAmount,
            isActive: config.isActive,
        });

        return {
            success: true,
            data: {
                id: config.id,
                strategy: config.strategy,
                maxBidAmount: config.maxBidAmount,
                isActive: config.isActive,
            },
        };
    }

    private async handleUpdateAutoBid(input: {
        auctionId: string;
        userId: string;
        strategy: 'SLOW' | 'FASTER' | 'SNIPER';
        maxBidAmount: number;
        updateAutoBidConfigUsecase: IUpdateAutoBidConfigUsecase;
    }): Promise<SocketAckPayload> {
        const updateResult = await input.updateAutoBidConfigUsecase.execute({
            auctionId: input.auctionId,
            userId: input.userId,
            strategy: input.strategy,
            maxBidAmount: input.maxBidAmount,
        });
        if (updateResult.isFailure) {
            return { success: false, error: updateResult.getError() };
        }

        const config = updateResult.getValue();
        this.socket.emit(SocketEvents.AUTO_BID_CONFIG_EDITED, {
            id: config.id,
            strategy: config.strategy,
            maxBidAmount: config.maxBidAmount,
            isActive: config.isActive,
        });

        return {
            success: true,
            data: {
                id: config.id,
                strategy: config.strategy,
                maxBidAmount: config.maxBidAmount,
                isActive: config.isActive,
            },
        };
    }

    async handleDisableAutoBid(payload: unknown): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(autoBidDisableSocketSchema, payload);
        if (!parsed.ok) return { success: false, error: parsed.error };

        const user = this.socket.data.user;
        const denied = authorizeUser(user, [UserRoleType.USER]);
        if (denied) return { success: false, error: denied.error };

        const disableAutoBidConfigUsecase =
            this.container.get<IDisableAutoBidConfigUsecase>(
                TYPES.IDisableAutoBidConfigUsecase,
            );
        const disableResult = await disableAutoBidConfigUsecase.execute({
            auctionId: parsed.data.auctionId,
            userId: user.id,
        });
        if (disableResult.isFailure) {
            return { success: false, error: disableResult.getError() };
        }
        const config = disableResult.getValue();

        this.socket.emit(SocketEvents.AUTO_BID_CONFIG_UPDATED, {
            id: config?.id ?? '',
            strategy: config?.strategy ?? 'SLOW',
            maxBidAmount: config?.maxBidAmount ?? 0,
            isActive: false,
        });

        return {
            success: true,
            data: {
                id: config?.id ?? '',
                strategy: config?.strategy ?? 'SLOW',
                maxBidAmount: config?.maxBidAmount ?? 0,
                isActive: false,
            },
        };
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
        const user = this.socket.data.user;
        const denied = this.authorizeUser(user, [UserRoleType.SELLER]);
        if (denied) return denied;

        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);

        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId } = parsed.data;

        const auctionRepo = this.container.get<IAuctionRepository>(
            TYPES.IAuctionRepository,
        );
        const auctionRes = await auctionRepo.findById(auctionId);
        if (auctionRes.isFailure) {
            return { success: false, error: auctionRes.getError() };
        }
        const auctionForControl = auctionRes.getValue();
        if (!auctionForControl) {
            return { success: false, error: 'Auction not found' };
        }
        if (auctionForControl.getSellerId() !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const sendFallbackPublicNotificationUsecase =
            this.container.get<ISendPublicFallbackPublicNotificationUsecase>(
                TYPES.ISendPublicFallbackPublicNotificationUsecase,
            );

        const result =
            await sendFallbackPublicNotificationUsecase.execute(auctionId);

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        const roomId = `auction:${auctionId}`;

        this.io.to(roomId).emit(SocketEvents.UPDATED, {
            auctionId: auctionId,
            status: AuctionStatus.FALLBACK_PUBLIC_NOTIFICATION,
        });

        return { success: true, data: { auctionId } };
    }

    async handleCreatePaymentOrderForPublicFallbackAuction(
        payload: unknown,
    ): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId } = parsed.data;
        const createPaymentOrderForPublicFallbackAuctionUsecase =
            this.container.get<ICreatePaymentOrderForPublicFallbackAuctionUsecase>(
                TYPES.ICreatePaymentOrderForPublicFallbackAuctionUsecase,
            );

        const result =
            await createPaymentOrderForPublicFallbackAuctionUsecase.execute({
                auctionId,
                userId: this.socket.data.user.id,
            });

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        const responsePayment = {
            orderId: result.getValue().orderId,
            amountInPaise: result.getValue().amountInPaise,
            currency: result.getValue().currency,
            gatewayKey: result.getValue().gatewayKey,
        };

        return { success: true, data: responsePayment };
    }

    async handleVerifyPaymentForPublicFallbackAuction(
        payload: unknown,
    ): Promise<SocketAckPayload> {
        console.log(payload);

        const parsed = parseSocketPayload(
            verifyFallbackAuctionPaymentSchema,
            payload,
        );

        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { orderId, signature, auctionId } = parsed.data;
        const verifyPaymentForPublicFallbackAuctionUsecase =
            this.container.get<IVerifyFallbackPublicAuctionPaymentUsecase>(
                TYPES.IVerifyFallbackPublicAuctionPaymentUsecase,
            );

        const result =
            await verifyPaymentForPublicFallbackAuctionUsecase.execute({
                orderId: orderId,
                signature: signature,
                auctionId: auctionId,
                userId: this.socket.data.user.id,
            });

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        await this.emitFallbackPublicParticipantStats(auctionId);

        const roomId = `auction:${auctionId}`;

        this.io.to(roomId).emit(SocketEvents.UPDATED, {
            auctionId: auctionId,
            status: AuctionStatus.SOLD,
        });

        return { success: true, data: { success: true } };
    }

    async handleDeclinePaymentForPublicFallbackAuction(
        payload: unknown,
    ): Promise<SocketAckPayload> {
        console.log(payload);
        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId } = parsed.data;
        const declinePaymentForPublicFallbackAuctionUsecase =
            this.container.get<IDeclinePublicFallbackAuctionUsecase>(
                TYPES.IDeclinePublicFallbackAuctionUsecase,
            );

        const result =
            await declinePaymentForPublicFallbackAuctionUsecase.execute({
                auctionId: auctionId,
                userId: this.socket.data.user.id,
            });

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        await this.emitFallbackPublicParticipantStats(auctionId);

        return { success: true, data: { success: true } };
    }

    private async emitFallbackPublicParticipantStats(auctionId: string) {
        const repo = this.container.get<IFallbackAuctionParticipantsRepo>(
            TYPES.IFallbackAuctionParticipantsRepo,
        );
        const listRes = await repo.findByAuctionId(auctionId);
        if (listRes.isFailure) return;

        let pending = 0;
        let rejected = 0;
        for (const p of listRes.getValue()) {
            const s = p.getStatus();
            if (s === PublicAuctionFallbackParticipantsStatus.PENDING) {
                pending += 1;
            } else if (s === PublicAuctionFallbackParticipantsStatus.REJECTED) {
                rejected += 1;
            }
        }

        const roomId = `auction:${auctionId}`;
        this.io.to(roomId).emit(SocketEvents.FALLBACK_STATS_UPDATED, {
            auctionId,
            fallbackPublicParticipantStats: { pending, rejected },
        });
    }

    async handleAddAuctionParticipant(
        payload: unknown,
    ): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId } = parsed.data;
        const addAuctionParticipantUsecase =
            this.container.get<IAddAuctionParticipantUsecase>(
                TYPES.IAddAuctionParticipantUsecase,
            );

        const result = await addAuctionParticipantUsecase.execute({
            auctionId,
            userId: this.socket.data.user.id,
        });

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        const roomId = `auction:${auctionId}`;
        const output = result.getValue();

        this.io
            .to(roomId)
            .emit(
                SocketEvents.PARTICIPANTS_UPDATED,
                output.auctionParticipants,
            );

        return { success: true, data: output };
    }

    async handleLiveAuctionGetCapabilities(
        payload: unknown,
    ): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId } = parsed.data;
        const roomId = this.parseLiveRoomId(auctionId);
        const roomResult = await this.container
            .get<IGetAuctionRoomUsecase>(TYPES.IGetAuctionRoomUsecase)
            .execute({
                userId: this.socket.data.user.id,
                auctionId,
                mode: 'USER',
            });

        if (roomResult.isFailure) {
            return { success: false, error: roomResult.getError() };
        }

        const roomData = roomResult.getValue();
        if (roomData.auction.auctionType !== AuctionType.LIVE) {
            return { success: false, error: 'Not a live auction' };
        }
        if (roomData.auction.status !== AuctionStatus.ACTIVE) {
            return { success: false, error: 'Auction is not active' };
        }

        if (!this._liveAuctionRoomManager.getAuctionRoom(roomId)) {
            const router = await this._mediasoupeManager.createRouter();
            this._liveAuctionRoomManager.createAuctionRoom(roomId, router);
        }

        const router =
            this._liveAuctionRoomManager.getAuctionRoom(roomId)?.router;

        if (!router) {
            console.log('dd');
            return { success: false, error: 'Router not found' };
        }

        const user = this.socket.data.user;
        const isHost =
            user.roles.includes(UserRoleType.ADMIN) ||
            user.roles.includes(UserRoleType.SELLER);

        this._liveAuctionRoomManager.joinAuctionRoom(roomId, {
            id: this.socket.id,
            username: user.name,
            role: isHost ? 'host' : 'viewer',
            isEnabledToSpeak: isHost,
            transport: null,
            producers: [],
            consumers: [],
        });

        const producerIds = this._liveAuctionRoomManager
            .getProducers(roomId)
            .map((producer) => producer.id);

        console.log('producerIds', producerIds);

        return {
            success: true,
            data: {
                roomId,
                isHost,
                rtpCapabilities: router.rtpCapabilities,
                producerIds,
            },
        };
    }

    async handleLiveAuctionCreateTransport(
        payload: unknown,
    ): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(auctionControlSocketSchema, payload);

        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const roomId = this.parseLiveRoomId(parsed.data.auctionId);
        const room = this._liveAuctionRoomManager.getAuctionRoom(roomId);
        if (!room) {
            return { success: false, error: 'Live room not ready' };
        }

        const user = this._liveAuctionRoomManager.getUser(
            roomId,
            this.socket.id,
        );
        if (!user) {
            return { success: false, error: 'Live user not joined' };
        }

        const transport = await this._mediasoupeManager.createTransport(
            room.router,
        );
        room.users.get(this.socket.id)!.transport = transport;

        return {
            success: true,
            data: {
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
            },
        };
    }

    async handleLiveAuctionConnectTransport(payload: unknown) {
        // test-- change
        const parsed = parseSocketPayload(
            auctionControlSocketSchema.extend({
                dtlsParameters: z.any(),
            }),
            payload,
        );

        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const roomId = this.parseLiveRoomId(parsed.data.auctionId);
        const user = this._liveAuctionRoomManager.getUser(
            roomId,
            this.socket.id,
        );
        if (!user) {
            return { success: false, error: 'Live user not joined' };
        }

        const transport = user.transport;

        if (!transport) {
            return { success: false, error: 'Transport not found' };
        }

        await transport.connect({
            dtlsParameters: parsed.data.dtlsParameters as DtlsParameters,
        });
        return { success: true };
    }

    async handleLiveAuctionProduce(
        payload: unknown,
    ): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(
            auctionControlSocketSchema.extend({
                kind: z.enum(['audio', 'video']),
                rtpParameters: z.any(),
            }),
            payload,
        );
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const roomId = this.parseLiveRoomId(parsed.data.auctionId);
        const user = this._liveAuctionRoomManager.getUser(
            roomId,
            this.socket.id,
        );
        if (!user || !user.isEnabledToSpeak) {
            return { success: false, error: 'Only host can publish media' };
        }
        if (!user.transport) {
            return { success: false, error: 'Transport not ready' };
        }

        const producer = await user.transport.produce({
            kind: parsed.data.kind,
            rtpParameters: parsed.data.rtpParameters,
        });

        this._liveAuctionRoomManager.addProducer(
            roomId,
            this.socket.id,
            producer,
        );

        producer.on('transportclose', () => {
            producer.close();
            this._liveAuctionRoomManager.removeProducer(roomId, producer.id);
            this.io.to(roomId).emit(SocketEvents.LIVE_AUCTION_PRODUCER_CLOSED, {
                producerId: producer.id,
            });
        });

        this.socket.to(roomId).emit(SocketEvents.LIVE_AUCTION_NEW_PRODUCER, {
            producerId: producer.id,
            socketId: this.socket.id,
            kind: producer.kind,
        });

        return { success: true, data: { id: producer.id } };
    }

    async handleLiveAuctionConsume(
        payload: unknown,
    ): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(
            auctionControlSocketSchema.extend({
                producerId: z.string().min(1),
                rtpCapabilities: z.any(),
            }),
            payload,
        );
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const roomId = this.parseLiveRoomId(parsed.data.auctionId);
        const room = this._liveAuctionRoomManager.getAuctionRoom(roomId);
        const user = this._liveAuctionRoomManager.getUser(
            roomId,
            this.socket.id,
        );

        if (!room || !user || !user.transport) {
            return { success: false, error: 'Transport not ready' };
        }

        if (
            !room.router.canConsume({
                producerId: parsed.data.producerId,
                rtpCapabilities: parsed.data.rtpCapabilities,
            })
        ) {
            return { success: false, error: 'Cannot consume this producer' };
        }

        const consumer = await user.transport.consume({
            producerId: parsed.data.producerId,
            rtpCapabilities: parsed.data.rtpCapabilities,
            paused: true,
        });

        this._liveAuctionRoomManager.addConsumer(
            roomId,
            this.socket.id,
            consumer,
        );
        consumer.on('transportclose', () => consumer.close());
        consumer.on('producerclose', () => {
            consumer.close();
            this.socket.emit(SocketEvents.LIVE_AUCTION_PRODUCER_CLOSED, {
                producerId: parsed.data.producerId,
            });
        });

        return {
            success: true,
            data: {
                id: consumer.id,
                producerId: parsed.data.producerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
            },
        };
    }

    async handleLiveAuctionResumeConsumer(
        payload: unknown,
    ): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(
            auctionControlSocketSchema.extend({
                consumerId: z.string().min(1),
            }),
            payload,
        );
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const roomId = this.parseLiveRoomId(parsed.data.auctionId);
        const user = this._liveAuctionRoomManager.getUser(
            roomId,
            this.socket.id,
        );
        if (!user) {
            return { success: false, error: 'Live user not joined' };
        }

        const consumer = user.consumers.find(
            (item) => item.id === parsed.data.consumerId,
        );
        if (!consumer) {
            return { success: false, error: 'Consumer not found' };
        }

        await consumer.resume();
        return { success: true };
    }

    handleSocketDisconnect(roomIds: string[]): void {
        console.log('hanlde sckdisconet: ', roomIds);
        for (const roomId of roomIds) {
            if (roomId.startsWith('auction:')) {
                this._liveAuctionRoomManager.leaveAuctionRoom(
                    roomId,
                    this.socket.id,
                );
            }
        }
    }
}

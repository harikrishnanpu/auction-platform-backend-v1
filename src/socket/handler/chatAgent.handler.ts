import { parseSocketPayload } from '../validators';
import { askAgentSocketSchema } from '../validators/askAgent.socket.schema';
import type { SocketAckPayload } from '../helpers/socket.ack';
import type { Socket } from 'socket.io';
import type { Container } from 'inversify';
import { TYPES } from '@di/types.di';
import type { ISendChatAgentMessageUsecase } from '@application/interfaces/usecases/aiAgents/ISendChatAgentMessageUsecase';
import type { AuthUser } from '@presentation/types/auth.user';

export class ChatAgentHandler {
    constructor(
        private readonly socket: Socket,
        private readonly container: Container,
    ) {}

    async handleAskAgent(payload: unknown): Promise<SocketAckPayload> {
        const parsed = parseSocketPayload(askAgentSocketSchema, payload);
        if (!parsed.ok) {
            return { success: false, error: parsed.error };
        }

        const { auctionId, message, lastMessages } = parsed.data;

        const authUser = this.socket.data.user as AuthUser | undefined;
        if (!authUser?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const chatAgentUsecase =
            this.container.get<ISendChatAgentMessageUsecase>(
                TYPES.ISendChatAgentMessageUsecase,
            );

        const result = await chatAgentUsecase.execute({
            userId: authUser.id,
            message,
            auctionId,
            lastMessages,
        });

        if (result.isFailure) {
            return { success: false, error: result.getError() };
        }

        return {
            success: true,
            data: { response: result.getValue() },
        };
    }
}

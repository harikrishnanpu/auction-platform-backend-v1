import { Result } from '@domain/shared/result';
import type { ChatHistoryMessage } from '@application/interfaces/usecases/aiAgents/ISendChatAgentMessageUsecase';

export type ChatAgentContext = {
    userId: string;
    message: string;
    auctionId?: string;
    platformScope: string;
    lastMessages?: ChatHistoryMessage[];
};

export interface IChatAgentService {
    run(context: ChatAgentContext): Promise<Result<string>>;
}

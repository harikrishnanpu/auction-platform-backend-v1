import { Result } from '@domain/shared/result';

export type ChatHistoryMessage = {
    role: 'user' | 'assistant';
    content: string;
};

export type IAskChatAgentInput = {
    userId: string;
    message: string;
    auctionId?: string;
    lastMessages?: ChatHistoryMessage[];
};

export interface ISendChatAgentMessageUsecase {
    execute(input: IAskChatAgentInput): Promise<Result<string>>;
}

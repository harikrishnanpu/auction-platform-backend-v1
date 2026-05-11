import { inject, injectable } from 'inversify';
import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import { CHAT_AGENT_PROMPT } from '@application/constants/prompts/chatAgent.prompt';
import type { IChatAgentService } from '@application/interfaces/services/IChatAgentService';
import type {
    IAskChatAgentInput,
    ISendChatAgentMessageUsecase,
} from '@application/interfaces/usecases/aiAgents/ISendChatAgentMessageUsecase';
import { MAX_MESSAGE_LEN } from '@application/constants/aiAgent/agent.constants';

@injectable()
export class SendChatAgentMessageUsecase implements ISendChatAgentMessageUsecase {
    constructor(
        @inject(TYPES.IChatAgentService)
        private readonly _chatAgent: IChatAgentService,
    ) {}

    async execute(input: IAskChatAgentInput): Promise<Result<string>> {
        const message = input.message.trim();
        if (!message) {
            return Result.fail('Message cannot be empty');
        }

        if (message.length > MAX_MESSAGE_LEN) {
            return Result.fail(`Message limit exeed:  ${MAX_MESSAGE_LEN}`);
        }

        return this._chatAgent.run({
            userId: input.userId,
            message,
            auctionId: input.auctionId,
            platformScope: CHAT_AGENT_PROMPT,
            lastMessages: input.lastMessages,
        });
    }
}

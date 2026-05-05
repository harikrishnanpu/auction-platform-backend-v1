import { ChatOllama } from '@langchain/ollama';
import {
    AIMessage,
    HumanMessage,
    type BaseMessage,
} from '@langchain/core/messages';
import { inject, injectable } from 'inversify';
import { createAgent } from 'langchain';

import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import type { ILogger } from '@application/interfaces/services/ILogger';
import type { IGetUserUsecase } from '@application/interfaces/usecases/auth/IGetUserUsecase';
import type {
    ChatAgentContext,
    IChatAgentService,
} from '@application/interfaces/services/IChatAgentService';
import { ToolFactory } from '../factory/toolFactory';
import { CHAT_AGENT_PROMPT } from '../constants/prompts/system.prompt';

@injectable()
export class OllamaChatAgentService implements IChatAgentService {
    private readonly chatModel: ChatOllama;

    constructor(
        @inject(TYPES.ILogger) private readonly _logger: ILogger,
        @inject(TYPES.IGetUserUsecase)
        private readonly _getUser: IGetUserUsecase,
        @inject(TYPES.IToolFactory)
        private readonly _toolFactory: ToolFactory,
    ) {
        const apiKey = process.env.OLLAMA_API_KEY;
        const baseUrl = process.env.OLLAMA_BASE_URL;
        const model = process.env.OLLAMA_MODEL;
        const temperature = Number(process.env.OLLAMA_TEMPERATURE);
        const cappedNumPredict = Number(process.env.OLLAMA_PREDICT_CAP);

        if (!apiKey || !baseUrl || !model) {
            throw new Error(
                'OLLAMA_API_KEY, OLLAMA_BASE_URL, OLLAMA_MODEL are required',
            );
        }

        this.chatModel = new ChatOllama({
            baseUrl,
            model,
            temperature: Number.isFinite(temperature) ? temperature : 0.7,
            numPredict: cappedNumPredict,
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });
    }

    async run(context: ChatAgentContext): Promise<Result<string>> {
        try {
            const userResult = await this._getUser.execute(context.userId);
            if (userResult.isFailure) {
                return Result.fail(userResult.getError());
            }
            const user = userResult.getValue();
            const userContext = {
                id: user.id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                isVerified: user.isVerified,
                isProfileCompleted: user.isProfileCompleted,
            };

            const sessionJson = JSON.stringify({
                focusedAuctionId: context.auctionId ?? null,
                user: userContext,
            });

            const systemPrompt = CHAT_AGENT_PROMPT(context, sessionJson);

            const tools = this._toolFactory.build({
                userId: context.userId,
                auctionId: context.auctionId,
            });

            const agent = createAgent({
                model: this.chatModel,
                tools,
                systemPrompt,
            });

            const history = (context.lastMessages ?? []).slice(-5);
            const messages: BaseMessage[] = history.map((m) =>
                m.role === 'user'
                    ? new HumanMessage(m.content)
                    : new AIMessage(m.content),
            );
            messages.push(new HumanMessage(context.message));

            const result = await agent.invoke(
                {
                    messages,
                },
                { recursionLimit: 10 },
            );

            const text = result.messages[result.messages.length - 1]
                .content as string;
            return Result.ok(text);
        } catch (err) {
            this._logger.error(`chat agent failed ${err}`);
            return Result.fail('The assistant failed!!');
        }
    }
}

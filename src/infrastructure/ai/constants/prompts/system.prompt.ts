import { ChatAgentContext } from '@application/interfaces/services/IChatAgentService';

export const CHAT_AGENT_PROMPT = (
    context: ChatAgentContext,
    sessionJson: string,
) => {
    return `${context.platformScope}

    Session context: ${sessionJson}

    Use the tools when the user asks about their account, auction details (you may need an auction id), auctions they joined, or dashboard counts. Combine tool results into a clear, concise answer. Never expose raw JSON blocks to the user.`;
};

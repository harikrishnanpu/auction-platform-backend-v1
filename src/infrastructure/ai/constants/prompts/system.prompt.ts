import { ChatAgentContext } from '@application/interfaces/services/IChatAgentService';

export const CHAT_AGENT_PROMPT = (
    context: ChatAgentContext,
    sessionJson: string,
) => {
    return `${context.platformScope}

    Session context: ${sessionJson}

    Use the tools when the user asks about their account, auction details (you may need an auction id), auctions they joined, or dashboard counts.
    Use search_platform_knowledge for platform knowledge, policies, and feature explanations (RAG source of truth).
    Combine tool results into a **short**, correct answer (same brevity rules as above: ~3–6 sentences or under ~120 words unless the user asks for more). Never expose raw JSON blocks to the user.`;
};

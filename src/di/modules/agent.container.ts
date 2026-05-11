import { ContainerModule } from 'inversify';
import { TYPES } from '@di/types.di';
import type { IChatAgentService } from '@application/interfaces/services/IChatAgentService';
import { OllamaChatAgentService } from '@infrastructure/ai/agents/ollamaChatAgent.service';
import type { ISendChatAgentMessageUsecase } from '@application/interfaces/usecases/aiAgents/ISendChatAgentMessageUsecase';
import { SendChatAgentMessageUsecase } from '@application/usecases/aiAgents/sendChatAgentMessage.usecase';
import { ToolFactory } from '@infrastructure/ai/factory/toolFactory';
import { GetAuctionDetailsTool } from '@infrastructure/ai/tools/auction/getAuctionDetails.tool';
import { GetMyParticipatedAuctionsTool } from '@infrastructure/ai/tools/auction/getMyParticipatedAuctions.tool';
import { GetMyAuctionOverviewTool } from '@infrastructure/ai/tools/auction/getMyAuctionOverview.tool';
import { SearchKnowledgeTool } from '@infrastructure/ai/tools/knowledge/searchKnowledge.tool';
import type { IKnowledgeVectorStore } from '@application/interfaces/services/IKnowledgeVectorStore';
import type { IKnowledgeVectorDb } from '@application/interfaces/services/IKnowledgeVectorDb';
import { KnowledgeVectorStoreService } from '@infrastructure/ai/vector/knowledgeVectorStore.service';
import { ChromaKnowledgeVectorDb } from '@infrastructure/database/chroma/chromaKnowledgeVectorDb';

export const agentContainer = new ContainerModule(({ bind }) => {
    bind<IKnowledgeVectorDb>(TYPES.IKnowledgeVectorDb)
        .to(ChromaKnowledgeVectorDb)
        .inSingletonScope();
    bind<IKnowledgeVectorStore>(TYPES.IKnowledgeVectorStore)
        .to(KnowledgeVectorStoreService)
        .inSingletonScope();

    bind(GetAuctionDetailsTool).toSelf();
    bind(GetMyParticipatedAuctionsTool).toSelf();
    bind(GetMyAuctionOverviewTool).toSelf();
    bind(SearchKnowledgeTool).toSelf();

    bind<ToolFactory>(TYPES.IToolFactory).to(ToolFactory);
    bind<IChatAgentService>(TYPES.IChatAgentService)
        .to(OllamaChatAgentService)
        .inSingletonScope();
    bind<ISendChatAgentMessageUsecase>(TYPES.ISendChatAgentMessageUsecase).to(
        SendChatAgentMessageUsecase,
    );
});

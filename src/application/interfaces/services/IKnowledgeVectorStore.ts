import { Result } from '@domain/shared/result';

export type KnowledgeVectorDbResult = {
    content: string;
    score: number;
    metadata?: Record<string, unknown>;
};

export interface IKnowledgeVectorStore {
    searchKnowledge(
        query: string,
        options?: { k?: number },
    ): Promise<Result<KnowledgeVectorDbResult[]>>;
}

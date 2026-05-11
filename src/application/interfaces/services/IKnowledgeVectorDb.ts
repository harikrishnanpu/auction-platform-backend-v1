export type KnowledgeVectorDbResult = {
    content: string;
    score: number;
    metadata: Record<string, unknown>;
};

export interface IKnowledgeVectorDb {
    search(text: string, k: number): Promise<KnowledgeVectorDbResult[]>;
}

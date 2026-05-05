import { injectable } from 'inversify';
import { ChromaClient } from 'chromadb';
import { OllamaEmbeddingFunction } from './ollamaChromaEmbedding';

import type {
    IKnowledgeVectorDb,
    KnowledgeVectorDbResult,
} from '@application/interfaces/services/IKnowledgeVectorDb';
import { APP_KNOWLEDGE_DOCS } from '@infrastructure/ai/knowledge/appKnowledge.docs';
// import dotenv from 'dotenv';
// dotenv.config();

@injectable()
export class ChromaKnowledgeVectorDb implements IKnowledgeVectorDb {
    private readonly client: ChromaClient;
    private readonly collectionName: string;
    private readonly embeddingFunction: OllamaEmbeddingFunction;

    constructor() {
        const host = process.env.CHROMA_HOST;
        const port = Number(process.env.CHROMA_PORT);
        const ollamaUrl = process.env.OLLAMA_BASE_URL;
        const ollamaModel = process.env.OLLAMA_EMBEDDING_MODEL;

        if (!host || !port || !ollamaUrl || !ollamaModel) {
            throw new Error(
                'Missing required ENV variables: CHROMA_HOST, CHROMA_PORT, OLLAMA_URL, OLLAMA_EMBEDDING_MODEL',
            );
        }

        this.client = new ChromaClient({ host, port });
        this.collectionName =
            process.env.CHROMA_COLLECTION_NAME ?? 'auction_platform_knowledge';

        this.embeddingFunction = new OllamaEmbeddingFunction(
            ollamaUrl,
            ollamaModel,
        );
    }

    async search(text: string, k: number): Promise<KnowledgeVectorDbResult[]> {
        const collection = await this.client.getOrCreateCollection({
            name: this.collectionName,
            embeddingFunction: this.embeddingFunction,
        });

        const count = await collection.count();
        if (count === 0) {
            const docs = APP_KNOWLEDGE_DOCS;
            await collection.add({
                ids: docs.map((_, i) => `doc-${i}`),
                documents: docs.map((d) => d.pageContent),
                metadatas: docs.map(
                    (d) => d.metadata as Record<string, string>,
                ),
            });
        }

        const results = await collection.query({
            queryTexts: [text],
            nResults: k,
        });

        const ids = results.ids[0] ?? [];
        const documents = results.documents[0] ?? [];
        const metadatas = results.metadatas[0] ?? [];
        const distances = results.distances?.[0] ?? [];

        return ids.map((id, i) => ({
            id,
            content: documents[i] ?? '',
            metadata: metadatas[i] ?? {},
            score: distances[i] ?? 0,
        }));
    }
}

import { inject, injectable } from 'inversify';
import { tool } from 'langchain';
import { z } from 'zod';

import { TYPES } from '@di/types.di';
import type { IKnowledgeVectorStore } from '@application/interfaces/services/IKnowledgeVectorStore';

@injectable()
export class SearchKnowledgeTool {
    constructor(
        @inject(TYPES.IKnowledgeVectorStore)
        private readonly _knowledgeStore: IKnowledgeVectorStore,
    ) {}

    build() {
        return tool(
            async ({ query }: { query: string }) => {
                const result = await this._knowledgeStore.searchKnowledge(
                    query,
                    {
                        k: 4,
                    },
                );

                if (result.isFailure) {
                    return JSON.stringify({ error: result.getError() });
                }

                const matches = result.getValue();
                return JSON.stringify({
                    query,
                    matches: matches.map((m) => ({
                        score: m.score,
                        content: m.content,
                        metadata: m.metadata ?? {},
                    })),
                });
            },
            {
                name: 'search_platform_knowledge',
                description:
                    'Search the platform knowledge base with RAG. Use for feature explanations, rules, and product guidance.',
                schema: z.object({
                    query: z
                        .string()
                        .min(3)
                        .max(300)
                        .describe('Knowledge search query'),
                }),
            },
        );
    }
}

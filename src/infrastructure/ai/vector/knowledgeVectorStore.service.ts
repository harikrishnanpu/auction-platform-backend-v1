import { inject, injectable } from 'inversify';

import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import type { IKnowledgeVectorDb } from '@application/interfaces/services/IKnowledgeVectorDb';
import type {
    KnowledgeVectorDbResult,
    IKnowledgeVectorStore,
} from '@application/interfaces/services/IKnowledgeVectorStore';

@injectable()
export class KnowledgeVectorStoreService implements IKnowledgeVectorStore {
    constructor(
        @inject(TYPES.IKnowledgeVectorDb)
        private readonly _knowledgeDb: IKnowledgeVectorDb,
    ) {}

    async searchKnowledge(
        query: string,
        options?: { k?: number },
    ): Promise<Result<KnowledgeVectorDbResult[]>> {
        try {
            const k = Math.min(Math.max(options?.k ?? 4, 1), 8);
            const result = await this._knowledgeDb.search(query, k);
            return Result.ok(result);
        } catch (err) {
            console.log(err);

            return Result.fail('Knowledge retrieval failed');
        }
    }
}

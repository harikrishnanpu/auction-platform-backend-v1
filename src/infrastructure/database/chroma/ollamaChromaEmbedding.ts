import { EmbeddingFunction } from 'chromadb';
import { Ollama } from 'ollama';

export class OllamaEmbeddingFunction implements EmbeddingFunction {
    private readonly ollama: Ollama;

    constructor(
        private readonly ollamaUrl: string,
        private readonly model: string,
    ) {
        this.ollama = new Ollama({ host: ollamaUrl });
    }

    async generate(texts: string[]): Promise<number[][]> {
        const embeddings = await Promise.all(
            texts.map(async (text) => {
                const { embedding } = await this.ollama.embeddings({
                    model: this.model,
                    prompt: text,
                });
                return embedding;
            }),
        );

        return embeddings;
    }
}

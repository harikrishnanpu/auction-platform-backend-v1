import { Result } from '@domain/shared/result';

export class SystemConfig {
    private constructor(
        private readonly id: string,
        private readonly key: string,
        private readonly value: string,
        private readonly description: string | null,
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
    ) {}

    static create(input: {
        id: string;
        key: string;
        value: string;
        description?: string | null;
        createdAt?: Date;
        updatedAt?: Date;
    }): Result<SystemConfig> {
        const now = new Date();
        return Result.ok(
            new SystemConfig(
                input.id,
                input.key.trim(),
                input.value,
                input.description ?? null,
                input.createdAt ?? now,
                input.updatedAt ?? now,
            ),
        );
    }

    getId(): string {
        return this.id;
    }

    getKey(): string {
        return this.key;
    }

    getValue(): string {
        return this.value;
    }

    getDescription(): string | null {
        return this.description;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }
}

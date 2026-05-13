import { Result } from '@domain/shared/result';

export enum SystemConfigKey {
    FRAUD_SUSPENSION_THRESHOLD = 'FRAUD_SUSPENSION_THRESHOLD',
    FRAUD_TEMPORARY_SUSPENSION_DURATION_MS = 'FRAUD_TEMPORARY_SUSPENSION_DURATION_MS',
    AUCTION_MIN_START_PRICE = 'AUCTION_MIN_START_PRICE',
    AUCTION_MAX_MAX_EXTENSION_COUNT = 'AUCTION_MAX_MAX_EXTENSION_COUNT',
    AUCTION_PAYMENT_DEPOSIT_DUE_MS = 'AUCTION_PAYMENT_DEPOSIT_DUE_MS',
    AUCTION_PAYMENT_BALANCE_DUE_MS = 'AUCTION_PAYMENT_BALANCE_DUE_MS',
    AUCTION_WINNER_DEPOSIT_SPLIT_RATIO = 'AUCTION_WINNER_DEPOSIT_SPLIT_RATIO',
    AUCTION_PARTICIPANT_INITIAL_DEPOSIT_RATIO = 'AUCTION_PARTICIPANT_INITIAL_DEPOSIT_RATIO',
    AUCTION_PUBLIC_FALLBACK_INITIAL_SPLIT_RATIO = 'AUCTION_PUBLIC_FALLBACK_INITIAL_SPLIT_RATIO',
    AUCTION_PUBLIC_FALLBACK_REMAINING_SPLIT_RATIO = 'AUCTION_PUBLIC_FALLBACK_REMAINING_SPLIT_RATIO',
    AUCTION_WINNER_FALLBACK_MAX_RANK = 'AUCTION_WINNER_FALLBACK_MAX_RANK',
}

export enum SystemConfigValueType {
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    BOOLEAN = 'BOOLEAN',
}

export class SystemConfig {
    private constructor(
        private readonly id: string,
        private readonly key: SystemConfigKey,
        private readonly valueType: SystemConfigValueType,
        private readonly value: string,
        private readonly description: string,
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
    ) {}

    static create({
        id,
        key,
        valueType,
        value,
        description,
        createdAt,
        updatedAt,
    }: {
        id: string;
        key: SystemConfigKey;
        valueType: SystemConfigValueType;
        value: string;
        description: string;
        createdAt?: Date;
        updatedAt?: Date;
    }): Result<SystemConfig> {
        const now = new Date();

        return Result.ok(
            new SystemConfig(
                id,
                key,
                valueType,
                value,
                description,
                createdAt ?? now,
                updatedAt ?? now,
            ),
        );
    }

    getId(): string {
        return this.id;
    }

    getKey(): SystemConfigKey {
        return this.key;
    }

    getValueType(): SystemConfigValueType {
        return this.valueType;
    }

    getValue(): string {
        return this.value;
    }

    getDescription(): string {
        return this.description;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }
}

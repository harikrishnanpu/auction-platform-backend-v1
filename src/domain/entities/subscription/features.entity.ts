import { Result } from '@domain/shared/result';

export enum SubscriptionFeatureKey {
    AUCTION_CREATION = 'AUCTION_CREATION',
    AUCTION_BIDDING = 'AUCTION_BIDDING',
    AI_AGENT = 'AI_AGENT',
}

export enum SubscriptionFeatureValueType {
    BOOLEAN = 'BOOLEAN',
    NUMBER = 'NUMBER',
    STRING = 'STRING',
}

export class Features {
    private constructor(
        private readonly id: string,
        private readonly featureKey: SubscriptionFeatureKey,
        private readonly type: SubscriptionFeatureValueType,
        private readonly description: string,
        private readonly createdAt: Date,
        private readonly updatedAt: Date,
    ) {}

    public static create({
        id,
        featureKey,
        description,
        type,
        createdAt,
        updatedAt,
    }: {
        id: string;
        featureKey: SubscriptionFeatureKey;
        type: SubscriptionFeatureValueType;
        description: string;
        createdAt: Date;
        updatedAt: Date;
    }): Result<Features> {
        return Result.ok(
            new Features(
                id,
                featureKey,
                type,
                description,
                createdAt,
                updatedAt,
            ),
        );
    }

    public getId(): string {
        return this.id;
    }

    public getFeatureKey(): SubscriptionFeatureKey {
        return this.featureKey;
    }

    public getDescription(): string {
        return this.description;
    }

    public getType(): SubscriptionFeatureValueType {
        return this.type;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }
}

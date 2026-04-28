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

export type AllowedSubscriptionFeature = {
    key: SubscriptionFeatureKey;
    valueType: SubscriptionFeatureValueType;
    description: string;
};

export const ALLOWED_SUBSCRIPTION_FEATURES: AllowedSubscriptionFeature[] = [
    {
        key: SubscriptionFeatureKey.AUCTION_CREATION,
        valueType: SubscriptionFeatureValueType.NUMBER,
        description: 'how many auctions can be created',
    },
    {
        key: SubscriptionFeatureKey.AUCTION_BIDDING,
        valueType: SubscriptionFeatureValueType.NUMBER,
        description: 'how many bids can be placed on auctions',
    },
    {
        key: SubscriptionFeatureKey.AI_AGENT,
        valueType: SubscriptionFeatureValueType.BOOLEAN,
        description: 'Whether the user can use AI agent features.',
    },
];

const byKey = new Map<SubscriptionFeatureKey, AllowedSubscriptionFeature>(
    ALLOWED_SUBSCRIPTION_FEATURES.map((f) => [f.key, f]),
);

export function getAllowedSubscriptionFeature(
    key: SubscriptionFeatureKey,
): AllowedSubscriptionFeature | undefined {
    return byKey.get(key);
}

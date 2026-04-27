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

export const DEFAULT_SUBSCRIPTION_FEATURE_KEYS: SubscriptionFeatureKey[] = [
    SubscriptionFeatureKey.AUCTION_CREATION,
    SubscriptionFeatureKey.AUCTION_BIDDING,
    SubscriptionFeatureKey.AI_AGENT,
];

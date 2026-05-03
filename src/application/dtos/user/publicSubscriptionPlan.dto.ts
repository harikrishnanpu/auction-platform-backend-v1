export type SubscriptionFeatureValueType = 'BOOLEAN' | 'NUMBER' | 'STRING';

export interface ISubscriptionPlanFeature {
    id: string;
    featureKey: string;
    description: string;
    value: string;
    type: SubscriptionFeatureValueType;
}

export interface IPublicSubscriptionPlaDto {
    id: string;
    name: string;
    description: string;
    price: number;
    durationDays: number;
    isDefault: boolean;
    features: ISubscriptionPlanFeature[];
    isCurrentPlan: boolean;
}

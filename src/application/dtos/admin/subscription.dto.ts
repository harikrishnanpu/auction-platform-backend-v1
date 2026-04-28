import {
    SubscriptionFeatureKey,
    SubscriptionFeatureValueType,
} from '@domain/constants/subscriptionFeature.constants';

export interface ICreateSubscriptionPlanFeatureRequestDto {
    featureKey: SubscriptionFeatureKey;
    value: string;
}

export interface ICreateSubscriptionPlanRequestDto {
    name: string;
    description: string;
    price: number;
    durationDays: number;
    isDefault: boolean;
    features: ICreateSubscriptionPlanFeatureRequestDto[];
}

export interface ICreateSubscriptionPlanFeatureInputDto {
    featureKey: SubscriptionFeatureKey;
    description: string;
    value: string;
    type: SubscriptionFeatureValueType;
}

export interface ICreateSubscriptionPlanInputDto {
    name: string;
    description: string;
    price: number;
    durationDays: number;
    isDefault: boolean;
    features: ICreateSubscriptionPlanFeatureInputDto[];
}

export interface ISubscriptionPlanFeatureDto {
    id: string;
    featureKey: SubscriptionFeatureKey;
    description: string;
    value: string;
    type: SubscriptionFeatureValueType;
}

export interface ISubscriptionPlanDto {
    id: string;
    name: string;
    description: string;
    price: number;
    durationDays: number;
    isDefault: boolean;
    isActive: boolean;
    razorpayPlanId: string | null;
    createdAt: Date;
    updatedAt: Date;
    features: ISubscriptionPlanFeatureDto[];
}

export interface IGetSubscriptionPlansOutputDto {
    plans: ISubscriptionPlanDto[];
}

export interface ISubscribedUserDto {
    userId: string;
    name: string;
    email: string;
    planId: string;
    planName: string;
    status: string;
    startDate: Date;
    endDate: Date;
    razorpaySubscriptionId: string | null;
}

export interface IGetSubscribedUsersOutputDto {
    subscriptions: ISubscribedUserDto[];
}

export interface IAllowedSubscriptionFeatureMetadataDto {
    key: SubscriptionFeatureKey;
    valueType: SubscriptionFeatureValueType;
    description: string;
}

export interface IGetSubscriptionFeatureMetadataOutputDto {
    features: IAllowedSubscriptionFeatureMetadataDto[];
}

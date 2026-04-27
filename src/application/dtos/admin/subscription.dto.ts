import {
    SubscriptionFeatureKey,
    SubscriptionFeatureValueType,
} from '@domain/constants/subscriptionFeature.constants';

export interface ICreateSubscriptionPlanFeatureInputDto {
    featureKey: SubscriptionFeatureKey;
    value: string;
    type: SubscriptionFeatureValueType;
}

export interface ICreateSubscriptionPlanInputDto {
    name: string;
    description: string;
    price: number;
    durationDays: number;
    features: ICreateSubscriptionPlanFeatureInputDto[];
}

export interface ISubscriptionPlanFeatureDto {
    id: string;
    featureKey: SubscriptionFeatureKey;
    value: string;
    type: SubscriptionFeatureValueType;
}

export interface ISubscriptionPlanDto {
    id: string;
    name: string;
    description: string;
    price: number;
    durationDays: number;
    isActive: boolean;
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
}

export interface IGetSubscribedUsersOutputDto {
    subscriptions: ISubscribedUserDto[];
}

export interface IGetSubscriptionFeatureMetadataOutputDto {
    featureKeys: string[];
    valueTypes: string[];
}

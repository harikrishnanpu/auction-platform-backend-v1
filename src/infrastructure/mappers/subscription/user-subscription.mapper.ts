import {
    UserSubscription,
    UserSubscriptionStatus,
} from '@domain/entities/subscription/user-subscription.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { UserSubscription as PrismaUserSubscription } from '@prisma/client';

export class UserSubscriptionMapper implements IDbMapper<
    UserSubscription,
    PrismaUserSubscription
> {
    toPersistence(entity: UserSubscription): unknown {
        return {
            id: entity.getId(),
            userId: entity.getUserId(),
            subscriptionPlanId: entity.getSubscriptionPlanId(),
            razorpaySubscriptionId: entity.getRazorpaySubscriptionId(),
            status: entity.getStatus(),
            startDate: entity.getStartDate(),
            endDate: entity.getEndDate(),
            createdAt: entity.getCreatedAt(),
            updatedAt: entity.getUpdatedAt(),
        };
    }

    toDomain(raw: PrismaUserSubscription): Result<UserSubscription> {
        return UserSubscription.create({
            id: raw.id,
            userId: raw.userId,
            subscriptionPlanId: raw.subscriptionPlanId,
            razorpaySubscriptionId: raw.razorpaySubscriptionId,
            status: raw.status as UserSubscriptionStatus,
            startDate: raw.startDate,
            endDate: raw.endDate,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }
}

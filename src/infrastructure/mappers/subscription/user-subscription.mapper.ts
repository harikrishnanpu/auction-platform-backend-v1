import {
    UserSubscription,
    UserSubscriptionStatus,
} from '@domain/entities/subscription/user-subscription.entity';
import { Result } from '@domain/shared/result';
import { UserSubscription as PrismaUserSubscriptionRow } from '@prisma/client';
import { injectable } from 'inversify';

@injectable()
export class UserSubscriptionMapper {
    toPersistence(entity: UserSubscription): PrismaUserSubscriptionRow {
        return {
            id: entity.getId(),
            userId: entity.getUserId(),
            subscriptionPlanId: entity.getSubscriptionPlanId(),
            razorpaySubscriptionId: entity.getRazorpaySubscriptionId(),
            status: entity.getStatus() as unknown as PrismaUserSubscriptionRow['status'],
            startDate: entity.getStartDate(),
            endDate: entity.getEndDate(),
            createdAt: entity.getCreatedAt(),
            updatedAt: entity.getUpdatedAt(),
        };
    }

    toDomain(raw: PrismaUserSubscriptionRow): Result<UserSubscription> {
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

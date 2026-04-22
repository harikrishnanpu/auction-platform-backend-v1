import {
    SuspensionType,
    UserSuspension,
} from '@domain/entities/fraud/user-suspension.entity';
import { IDbMapper } from '@domain/mappers/IDbMapper';
import { Result } from '@domain/shared/result';
import { UserSuspension as PrismaUserSuspension } from '@prisma/client';

export class UserSuspensionMapper implements IDbMapper<
    UserSuspension,
    PrismaUserSuspension
> {
    toDomain(raw: PrismaUserSuspension): Result<UserSuspension> {
        return UserSuspension.create({
            id: raw.id,
            userId: raw.userId,
            reportId: raw.reportId,
            type: raw.type as SuspensionType,
            reason: raw.reason,
            startsAt: raw.startsAt,
            endsAt: raw.endsAt,
            isActive: raw.isActive,
            createdAt: raw.createdAt,
        });
    }

    toPersistence(entity: UserSuspension): unknown {
        return {
            id: entity.getId(),
            userId: entity.getUserId(),
            reportId: entity.getReportId(),
            type: entity.getType(),
            reason: entity.getReason(),
            startsAt: entity.getStartsAt(),
            endsAt: entity.getEndsAt(),
            isActive: entity.getIsActive(),
            createdAt: entity.getCreatedAt(),
        };
    }
}

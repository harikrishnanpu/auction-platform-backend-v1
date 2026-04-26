import { Result } from '@domain/shared/result';

export enum SuspensionType {
    TEMPORARY = 'TEMPORARY',
    PERMANENT = 'PERMANENT',
}

export class UserSuspension {
    private constructor(
        private readonly id: string,
        private readonly userId: string,
        private readonly reportId: string | null,
        private readonly type: SuspensionType,
        private readonly reason: string,
        private readonly startsAt: Date,
        private readonly endsAt: Date | null,
        private isActive: boolean,
        private readonly createdAt: Date,
    ) {}

    static create(input: {
        id: string;
        userId: string;
        reportId?: string | null;
        type: SuspensionType;
        reason: string;
        startsAt?: Date;
        endsAt?: Date | null;
        isActive?: boolean;
        createdAt?: Date;
    }): Result<UserSuspension> {
        return Result.ok(
            new UserSuspension(
                input.id,
                input.userId,
                input.reportId ?? null,
                input.type,
                input.reason,
                input.startsAt ?? new Date(),
                input.endsAt ?? null,
                input.isActive ?? true,
                input.createdAt ?? new Date(),
            ),
        );
    }

    deactivate() {
        this.isActive = false;
    }

    getId() {
        return this.id;
    }
    getUserId() {
        return this.userId;
    }
    getReportId() {
        return this.reportId;
    }
    getType() {
        return this.type;
    }
    getReason() {
        return this.reason;
    }
    getStartsAt() {
        return this.startsAt;
    }
    getEndsAt() {
        return this.endsAt;
    }
    getIsActive() {
        return this.isActive;
    }
    getCreatedAt() {
        return this.createdAt;
    }
}

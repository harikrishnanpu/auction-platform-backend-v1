import { ISuspensionUserItemDto } from '@application/dtos/fraud/fraud-report.dto';
import { IGetSuspensionUsersUsecase } from '@application/interfaces/usecases/fraud/IGetSuspensionTimelineUsecase';
import { TYPES } from '@di/types.di';
import { IUserSuspensionRepository } from '@domain/repositories/IUserSuspensionRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetSuspensionUsersUsecase implements IGetSuspensionUsersUsecase {
    constructor(
        @inject(TYPES.IUserSuspensionRepository)
        private readonly _suspensionRepository: IUserSuspensionRepository,
    ) {}

    async execute(userId: string): Promise<Result<ISuspensionUserItemDto[]>> {
        const result =
            await this._suspensionRepository.findUserSuspensions(userId);
        if (result.isFailure) return Result.fail(result.getError());
        return Result.ok(
            result.getValue().map((item) => ({
                id: item.getId(),
                userId: item.getUserId(),
                reportId: item.getReportId(),
                type: item.getType(),
                reason: item.getReason(),
                startsAt: item.getStartsAt(),
                endsAt: item.getEndsAt(),
                isActive: item.getIsActive(),
                createdAt: item.getCreatedAt(),
            })),
        );
    }
}

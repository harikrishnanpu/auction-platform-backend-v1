import { ISuspensionTimelineItemDto } from '@application/dtos/fraud/fraud-report.dto';
import { Result } from '@domain/shared/result';

export interface IGetSuspensionTimelineUsecase {
    execute(userId: string): Promise<Result<ISuspensionTimelineItemDto[]>>;
}

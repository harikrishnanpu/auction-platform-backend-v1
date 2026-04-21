import { IGetAdminDashboardStatsOutputDto } from '@application/dtos/admin/getAdminDashboardStats.dto';
import { Result } from '@domain/shared/result';

export interface IGetAdminDashboardStatsUsecase {
    execute(): Promise<Result<IGetAdminDashboardStatsOutputDto>>;
}

import { ISellerDashboardStatsDto } from '@application/dtos/seller/sellerDashboardStats.dto';
import { Result } from '@domain/shared/result';

export interface IGetSellerDashboardStatsUsecase {
    execute(input: {
        sellerId: string;
    }): Promise<Result<ISellerDashboardStatsDto>>;
}

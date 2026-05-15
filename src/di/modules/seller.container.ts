import { IGetAllSellerAuctionCategoryRequestUsecase } from '@application/interfaces/usecases/seller/IGetAllAuctioncategoryRequestUsecase';
import { IRequestAuctionCategoryUsecase } from '@application/interfaces/usecases/seller/IRequestAuctionCategory.usecase';
import { IGetSellerDashboardStatsUsecase } from '@application/interfaces/usecases/seller/IGetSellerDashboardStatsUsecase';
import { RequestAuctionCategoryUsecase } from '@application/usecases/seller/requestAuctionCategory.usecase';
import { GetAllSellerAuctionCategoryRequestUsecase } from '@application/usecases/seller/getAllAuctionCategory.usecase';
import { TYPES } from '@di/types.di';
import { ContainerModule } from 'inversify';
import { IGetAllSellerAuctionsUsecase } from '@application/interfaces/usecases/seller/IGetallAuctionsUsecase';
import { GetAllSellerAuctionsUsecase } from '@application/usecases/seller/getAllAuctions.usecase';
import { GetSellerDashboardStatsUsecase } from '@application/usecases/seller/getSellerDashboardStats.usecase';

export const sellerContainer = new ContainerModule(({ bind }) => {
    bind<IGetAllSellerAuctionCategoryRequestUsecase>(
        TYPES.IGetAllSellerAuctionCategoryRequestUsecase,
    ).to(GetAllSellerAuctionCategoryRequestUsecase);
    bind<IRequestAuctionCategoryUsecase>(
        TYPES.IRequestAuctionCategoryUsecase,
    ).to(RequestAuctionCategoryUsecase);
    bind<IGetAllSellerAuctionsUsecase>(TYPES.IGetAllSellerAuctionsUsecase).to(
        GetAllSellerAuctionsUsecase,
    );
    bind<IGetSellerDashboardStatsUsecase>(
        TYPES.IGetSellerDashboardStatsUsecase,
    ).to(GetSellerDashboardStatsUsecase);
});

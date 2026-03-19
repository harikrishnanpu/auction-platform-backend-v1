import { IRequestAuctionCategoryUsecase } from '@application/interfaces/usecases/seller/IRequestAuctionCategory.usecase';
import { IGetAllSellerAuctionCategoryRequestUsecase } from '@application/interfaces/usecases/seller/IGetAllAuctioncategoryRequestUsecase';
import { RequestAuctionCategoryUsecase } from '@application/usecases/seller/requestAuctionCategory.usecase';
import { GetAllSellerAuctionCategoryRequestUsecase } from '@application/usecases/seller/getAllAuctionCategory.usecase';
import { TYPES } from '@di/types.di';
import { ContainerModule } from 'inversify';

export const sellerContainer = new ContainerModule(({ bind }) => {
  bind<IGetAllSellerAuctionCategoryRequestUsecase>(
    TYPES.IGetAllSellerAuctionCategoryRequestUsecase,
  ).to(GetAllSellerAuctionCategoryRequestUsecase);
  bind<IRequestAuctionCategoryUsecase>(TYPES.IRequestAuctionCategoryUsecase).to(
    RequestAuctionCategoryUsecase,
  );
});

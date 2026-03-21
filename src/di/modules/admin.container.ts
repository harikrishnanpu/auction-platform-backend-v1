import { IApproveSellerKycUsecase } from '@application/interfaces/usecases/admin/IApproveSellerKycUsecase';
import { IBlockUserUsecase } from '@application/interfaces/usecases/admin/IBlockUserUsecase';
import { IGetAdminSellerUsecase } from '@application/interfaces/usecases/admin/IGetAdminSellerUsecase';
import { IGetAdminUserUsecase } from '@application/interfaces/usecases/admin/IGetAdminUserUsecase';
import { IGetAllSellersUsecase } from '@application/interfaces/usecases/admin/IGetAllSellersUsecase';
import { IGetAllUsersUsecase } from '@application/interfaces/usecases/admin/IGetAllUsersUsecase';
import { IRejectSellerKycUsecase } from '@application/interfaces/usecases/admin/IRejectSellerKycUsecase';
import { ApproveSellerKycUseCase } from '@application/usecases/admin/approveSellerKyc.usecase';
import { BlockUserUseCase } from '@application/usecases/admin/blockUser.usecase';
import { GetAllUsersUseCase } from '@application/usecases/admin/getAllUsers.usecase';
import { GetAdminUserUseCase } from '@application/usecases/admin/getUser.usecase';
import { GetAdminSellerUseCase } from '@application/usecases/admin/getAdminSeller.usecase';
import { GetAllSellersUseCase } from '@application/usecases/admin/getAllSellers.usecase';
import { RejectSellerKycUseCase } from '@application/usecases/admin/rejectSellerKyc.usecase';
import { TYPES } from '@di/types.di';
import { ContainerModule } from 'inversify';
import { GetAllCategoryRequestUsecase } from '@application/usecases/admin/getAllcategoryrequest.usecase';
import { IGetAllCategoryRequestUsecase } from '@application/interfaces/usecases/admin/IGetAllCategoryrequestusecase';
import { IApproveAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/IApproveAuctioncategoryUsecasse';
import { ApproveAuctionCategoryUsecase } from '@application/usecases/admin/approveAuctionCategory.usecase';
import { IChangeAuctionCategoryStatusUsecase } from '@application/interfaces/usecases/admin/IChangeAuctionCategoyUsecase';
import { ChangeAuctionCategoryStatusUsecase } from '@application/usecases/admin/changeAuctionCategoryStatus.usecase';
import { IGetAllAdminAuctionCategoriesUsecase } from '@application/interfaces/usecases/admin/IGetAllAuctionCategoriesUsecase';
import { GetAllAdminAuctionCategoriesUsecase } from '@application/usecases/admin/getAllAdminAuctionCategories.usecase';
import { IUpdateAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/IUpdateAuctioncategoryUsecase';
import { UpdateAuctionCategoryUsecase } from '@application/usecases/admin/updateAuctionCategory.usecase';
import { IViewKycUsecase } from '@application/interfaces/usecases/admin/IViewKycUsecase';
import { ViewKycUsecase } from '@application/usecases/admin/viewKycUsecase';
import { IRejectAuctionCategoryrequestUsecase } from '@application/interfaces/usecases/admin/IRejectAuctionCategoryrequestusecase';
import { RejectAuctionCategoryUsecase } from '@application/usecases/admin/rejectAuctionCategory.usecase';
import { IGetAdminAuctionsUsecase } from '@application/interfaces/usecases/admin/IGetAdminAuctionsUsecase';
import { GetAdminAuctionsUsecase } from '@application/usecases/admin/getAdminAuctions.usecase';

export const adminContainer = new ContainerModule(({ bind }) => {
  console.log('Admin container loaded');

  bind<IGetAllUsersUsecase>(TYPES.IGetAllUsersUseCase).to(GetAllUsersUseCase);
  bind<IBlockUserUsecase>(TYPES.IBlockUserUsecase).to(BlockUserUseCase);
  bind<IGetAdminUserUsecase>(TYPES.IGetAdminUserUsecase).to(
    GetAdminUserUseCase,
  );
  bind<IGetAllSellersUsecase>(TYPES.IGetAllSellersUsecase).to(
    GetAllSellersUseCase,
  );
  bind<IGetAdminSellerUsecase>(TYPES.IGetAdminSellerUsecase).to(
    GetAdminSellerUseCase,
  );
  bind<IApproveSellerKycUsecase>(TYPES.IApproveSellerKycUsecase).to(
    ApproveSellerKycUseCase,
  );
  bind<IRejectSellerKycUsecase>(TYPES.IRejectSellerKycUsecase).to(
    RejectSellerKycUseCase,
  );
  bind<IGetAllCategoryRequestUsecase>(TYPES.IGetAllCategoryRequestUsecase).to(
    GetAllCategoryRequestUsecase,
  );

  bind<IApproveAuctionCategoryUsecase>(TYPES.IApproveAuctionCategoryUsecase).to(
    ApproveAuctionCategoryUsecase,
  );
  bind<IChangeAuctionCategoryStatusUsecase>(
    TYPES.IChangeAuctionCategoryStatusUsecase,
  ).to(ChangeAuctionCategoryStatusUsecase);
  bind<IGetAllAdminAuctionCategoriesUsecase>(
    TYPES.IGetAllAdminAuctionCategoriesUsecase,
  ).to(GetAllAdminAuctionCategoriesUsecase);

  bind<IGetAdminAuctionsUsecase>(TYPES.IGetAdminAuctionsUsecase).to(
    GetAdminAuctionsUsecase,
  );

  bind<IUpdateAuctionCategoryUsecase>(TYPES.IUpdateAuctionCategoryUsecase).to(
    UpdateAuctionCategoryUsecase,
  );
  bind<IViewKycUsecase>(TYPES.IViewKycUsecase).to(ViewKycUsecase);
  bind<IRejectAuctionCategoryrequestUsecase>(
    TYPES.IRejectAuctionCategoryUsecase,
  ).to(RejectAuctionCategoryUsecase);
});

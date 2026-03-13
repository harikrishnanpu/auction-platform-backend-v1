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
});

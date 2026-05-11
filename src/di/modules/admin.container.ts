import { IApproveSellerKycUsecase } from '@application/interfaces/usecases/admin/IApproveSellerKycUsecase';
import { IBlockUserUsecase } from '@application/interfaces/usecases/admin/IBlockUserUsecase';
import { IGetAdminSellerUsecase } from '@application/interfaces/usecases/admin/IGetAdminSellerUsecase';
import { IGetAdminUserUsecase } from '@application/interfaces/usecases/admin/IGetAdminUserUsecase';
import { IGetAllSellersUsecase } from '@application/interfaces/usecases/admin/IGetAllSellersUsecase';
import { IGetAdminDashboardStatsUsecase } from '@application/interfaces/usecases/admin/IGetAdminDashboardStatsUsecase';
import { IGetAllUsersUsecase } from '@application/interfaces/usecases/admin/IGetAllUsersUsecase';
import { IRejectSellerKycUsecase } from '@application/interfaces/usecases/admin/IRejectSellerKycUsecase';
import { ApproveSellerKycUseCase } from '@application/usecases/admin/approveSellerKyc.usecase';
import { BlockUserUseCase } from '@application/usecases/admin/blockUser.usecase';
import { GetAllUsersUseCase } from '@application/usecases/admin/getAllUsers.usecase';
import { GetAdminUserUseCase } from '@application/usecases/admin/getUser.usecase';
import { GetAdminSellerUseCase } from '@application/usecases/admin/getAdminSeller.usecase';
import { GetAllSellersUseCase } from '@application/usecases/admin/getAllSellers.usecase';
import { GetAdminDashboardStatsUsecase } from '@application/usecases/admin/getAdminDashboardStats.usecase';
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
import { ICreateAuctionCategoryUsecase } from '@application/interfaces/usecases/admin/ICreateAuctionCategoryUsecase';
import { CreateAuctionCategoryUsecase } from '@application/usecases/admin/createAuctionCategory.usecase';
import { IGetSystemConfigsUsecase } from '@application/interfaces/usecases/admin/IGetSystemConfigsUsecase';
import { GetSystemConfigsUsecase } from '@application/usecases/admin/getSystemConfigs.usecase';
import { IEditSystemConfigUsecase } from '@application/interfaces/usecases/admin/IEditSystemConfigUsecase';
import { EditSystemConfigUsecase } from '@application/usecases/admin/editSystemConfig.usecase';
import { ISystemConfigService } from '@application/interfaces/services/ISystemConfigService';
import { SystemConfigService } from '@infrastructure/services/system-config/system-config.service';
import { ISystemConfigRepository } from '@domain/repositories/ISystemConfigRepository';
import { PrismaSystemConfigRepository } from '@infrastructure/repositories/system-config/system-config.repo';
import { ICreateSubscriptionPlanUsecase } from '@application/interfaces/usecases/admin/ICreateSubscriptionPlanUsecase';
import { CreateSubscriptionPlanUsecase } from '@application/usecases/admin/createSubscriptionPlan.usecase';
import { IGetSubscriptionPlansUsecase } from '@application/interfaces/usecases/admin/IGetSubscriptionPlansUsecase';
import { GetSubscriptionPlansUsecase } from '@application/usecases/admin/getSubscriptionPlans.usecase';
import { IGetSubscribedUsersUsecase } from '@application/interfaces/usecases/admin/IGetSubscribedUsersUsecase';
import { GetSubscribedUsersUsecase } from '@application/usecases/admin/getSubscribedUsers.usecase';
import { IGetSubscriptionFeaturesUsecase } from '@application/interfaces/usecases/admin/IGetSubscriptionFeatureUsecase';
import { GetSubscriptionFeaturesUsecase } from '@application/usecases/admin/getSubscriptionFeatures.usecase';
import { IUpdateSubscriptionPlanStatusUsecase } from '@application/interfaces/usecases/admin/IUpdateSubscriptionPlanStatusUsecase';
import { UpdateSubscriptionPlanStatusUsecase } from '@application/usecases/admin/updateSubscriptionPlanStatus.usecase';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { PrismaSubscriptionPlanRepository } from '@infrastructure/repositories/subscription/subscription-plan.repo';
import { IUserSubscriptionRepository } from '@domain/repositories/IUserSubscriptionRepository';
import { PrismaUserSubscriptionRepository } from '@infrastructure/repositories/subscription/user-subscription.repo';
import { ISubscriptionFeaturesRepository } from '@domain/repositories/ISubscriptionFetauresRepository';
import { PrismaSubscriptionFeaturesRepository } from '@infrastructure/repositories/subscription/subscription-features.repo';
import { IUpdateSubscriptionPlanUsecase } from '@application/interfaces/usecases/admin/IUpdateSubscriptionPlanUsecase';
import { UpdateSubscriptionPlanUsecase } from '@application/usecases/admin/updateSubscriptionPlan.usecase';
import { SubscriptionService } from '@infrastructure/services/subscription/subscription.service';
import { ISubscriptionService } from '@application/interfaces/services/ISubscriptionService';

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
    bind<IGetAdminDashboardStatsUsecase>(
        TYPES.IGetAdminDashboardStatsUsecase,
    ).to(GetAdminDashboardStatsUsecase);
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

    bind<IApproveAuctionCategoryUsecase>(
        TYPES.IApproveAuctionCategoryUsecase,
    ).to(ApproveAuctionCategoryUsecase);
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
    bind<ICreateAuctionCategoryUsecase>(TYPES.ICreateAuctionCategoryUsecase).to(
        CreateAuctionCategoryUsecase,
    );
    bind<IViewKycUsecase>(TYPES.IViewKycUsecase).to(ViewKycUsecase);
    bind<IRejectAuctionCategoryrequestUsecase>(
        TYPES.IRejectAuctionCategoryUsecase,
    ).to(RejectAuctionCategoryUsecase);
    bind<IGetSystemConfigsUsecase>(TYPES.IGetSystemConfigsUsecase).to(
        GetSystemConfigsUsecase,
    );
    bind<IEditSystemConfigUsecase>(TYPES.IEditSystemConfigUsecase).to(
        EditSystemConfigUsecase,
    );
    bind<ISystemConfigRepository>(TYPES.ISystemConfigRepository).to(
        PrismaSystemConfigRepository,
    );
    bind<ISystemConfigService>(TYPES.ISystemConfigService).to(
        SystemConfigService,
    );
    bind<ICreateSubscriptionPlanUsecase>(
        TYPES.ICreateSubscriptionPlanUsecase,
    ).to(CreateSubscriptionPlanUsecase);
    bind<IUpdateSubscriptionPlanStatusUsecase>(
        TYPES.IUpdateSubscriptionPlanStatusUsecase,
    ).to(UpdateSubscriptionPlanStatusUsecase);
    bind<IGetSubscriptionPlansUsecase>(TYPES.IGetSubscriptionPlansUsecase).to(
        GetSubscriptionPlansUsecase,
    );
    bind<IGetSubscribedUsersUsecase>(TYPES.IGetSubscribedUsersUsecase).to(
        GetSubscribedUsersUsecase,
    );
    bind<IGetSubscriptionFeaturesUsecase>(
        TYPES.IGetSubscriptionFeaturesUsecase,
    ).to(GetSubscriptionFeaturesUsecase);
    bind<ISubscriptionPlanRepository>(TYPES.ISubscriptionPlanRepository).to(
        PrismaSubscriptionPlanRepository,
    );
    bind<IUserSubscriptionRepository>(TYPES.IUserSubscriptionRepository).to(
        PrismaUserSubscriptionRepository,
    );
    bind<ISubscriptionFeaturesRepository>(
        TYPES.ISubscriptionFeaturesRepository,
    ).to(PrismaSubscriptionFeaturesRepository);
    bind<IUpdateSubscriptionPlanUsecase>(
        TYPES.IUpdateSubscriptionPlanUsecase,
    ).to(UpdateSubscriptionPlanUsecase);
    bind<ISubscriptionService>(TYPES.ISubscriptionService).to(
        SubscriptionService,
    );
});

import { ICreateAuctionUsecase } from '@application/interfaces/usecases/auction/ICreateAuctionUsecase';
import { IGenerateAuctionUploadUrlUsecase } from '@application/interfaces/usecases/auction/IGenerateAuctionUploadUrlUsecase';
import { IUpdateAuctionUsecase } from '@application/interfaces/usecases/auction/IUpdateAuctionUsecase';
import { IPublishAuctionUsecase } from '@application/interfaces/usecases/auction/IPublishAuctionUsecase';
import { IEndAuctionUsecase } from '@application/interfaces/usecases/auction/IEndAuctionUsecase';
import { IPlaceBidUsecase } from '@application/interfaces/usecases/auction/IPlaceBidUsecase';
import { CreateAuctionUsecase } from '@application/usecases/auction/createAuction.usecase';
import { GenerateAuctionUploadUrlUsecase } from '@application/usecases/auction/generateAuctionUploadUrl.usecase';
import { UpdateAuctionUsecase } from '@application/usecases/auction/updateAuction.usecase';
import { PublishAuctionUsecase } from '@application/usecases/auction/publishAuction.usecase';
import { EndAuctionUsecase } from '@application/usecases/auction/endAuction.usecase';
import { PlaceBidUsecase } from '@application/usecases/auction/placeBid.usecase';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { PrismaAuctionRepo } from '@infrastructure/repositories/auction/auction.repo';
import { PrismaBidRepo } from '@infrastructure/repositories/auction/bid.repo';
import { PrismaAuctionParticipantRepo } from '@infrastructure/repositories/auction/auction-participant.repo';
import { ContainerModule } from 'inversify';
import { IRequestAuctionCategoryUsecase } from '@application/interfaces/usecases/auction/IRequestAuctionCategory.usecase';
import { RequestAuctionCategoryUsecase } from '@application/usecases/auction/requestAuctionCategory.usecase';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { PrismaAuctionCategoryRepository } from '@infrastructure/repositories/auction/auction-category.repo';
import { ISlugGeneratorService } from '@application/interfaces/services/ISlugGeneratorService';
import { SlugGeneratorService } from '@infrastructure/services/slug/SlugGenerator.service';
import { IGetAllAuctionCategoriesUsecase } from '@application/interfaces/usecases/auction/IGetAllAuctionCategoriesUsecase';
import { GetAllAuctionCategoryUsecase } from '@application/usecases/auction/getAllAuctionCategory.usecase';

export const auctionContainer = new ContainerModule(({ bind }) => {
  bind<IAuctionRepository>(TYPES.IAuctionRepository).to(PrismaAuctionRepo);
  bind<IBidRepository>(TYPES.IBidRepository).to(PrismaBidRepo);
  bind<IAuctionParticipantRepository>(TYPES.IAuctionParticipantRepository).to(
    PrismaAuctionParticipantRepo,
  );
  bind<ICreateAuctionUsecase>(TYPES.ICreateAuctionUsecase).to(
    CreateAuctionUsecase,
  );

  bind<IGenerateAuctionUploadUrlUsecase>(
    TYPES.IGenerateAuctionUploadUrlUsecase,
  ).to(GenerateAuctionUploadUrlUsecase);
  bind<IUpdateAuctionUsecase>(TYPES.IUpdateAuctionUsecase).to(
    UpdateAuctionUsecase,
  );
  bind<IPublishAuctionUsecase>(TYPES.IPublishAuctionUsecase).to(
    PublishAuctionUsecase,
  );
  bind<IEndAuctionUsecase>(TYPES.IEndAuctionUsecase).to(EndAuctionUsecase);
  bind<IPlaceBidUsecase>(TYPES.IPlaceBidUsecase).to(PlaceBidUsecase);
  bind<IRequestAuctionCategoryUsecase>(TYPES.IRequestAuctionCategoryUsecase).to(
    RequestAuctionCategoryUsecase,
  );
  bind<IAuctionCategoryRepository>(TYPES.IAuctionCategoryRepository).to(
    PrismaAuctionCategoryRepository,
  );
  bind<ISlugGeneratorService>(TYPES.ISlugGeneratorService).to(
    SlugGeneratorService,
  );

  bind<IGetAllAuctionCategoriesUsecase>(
    TYPES.IGetAllAuctionCategoriesUsecase,
  ).to(GetAllAuctionCategoryUsecase);
});

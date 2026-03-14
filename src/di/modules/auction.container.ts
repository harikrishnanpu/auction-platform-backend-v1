import { ICreateAuctionUsecase } from '@application/interfaces/usecases/auction/ICreateAuctionUsecase';
import { IGetSellerAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetSellerAuctionsUsecase';
import { IGetAuctionByIdUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { IGetBrowseAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetBrowseAuctionsUsecase';
import { IGenerateAuctionUploadUrlUsecase } from '@application/interfaces/usecases/auction/IGenerateAuctionUploadUrlUsecase';
import { IUpdateAuctionUsecase } from '@application/interfaces/usecases/auction/IUpdateAuctionUsecase';
import { IPublishAuctionUsecase } from '@application/interfaces/usecases/auction/IPublishAuctionUsecase';
import { CreateAuctionUsecase } from '@application/usecases/auction/createAuction.usecase';
import { GetSellerAuctionsUsecase } from '@application/usecases/auction/getSellerAuctions.usecase';
import { GetAuctionByIdUsecase } from '@application/usecases/auction/getAuctionById.usecase';
import { GetBrowseAuctionsUsecase } from '@application/usecases/auction/getBrowseAuctions.usecase';
import { GenerateAuctionUploadUrlUsecase } from '@application/usecases/auction/generateAuctionUploadUrl.usecase';
import { UpdateAuctionUsecase } from '@application/usecases/auction/updateAuction.usecase';
import { PublishAuctionUsecase } from '@application/usecases/auction/publishAuction.usecase';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { PrismaAuctionRepo } from '@infrastructure/repositories/auction/auction.repo';
import { ContainerModule } from 'inversify';

export const auctionContainer = new ContainerModule(({ bind }) => {
  bind<IAuctionRepository>(TYPES.IAuctionRepository).to(PrismaAuctionRepo);
  bind<ICreateAuctionUsecase>(TYPES.ICreateAuctionUsecase).to(
    CreateAuctionUsecase,
  );
  bind<IGetSellerAuctionsUsecase>(TYPES.IGetSellerAuctionsUsecase).to(
    GetSellerAuctionsUsecase,
  );
  bind<IGetAuctionByIdUsecase>(TYPES.IGetAuctionByIdUsecase).to(
    GetAuctionByIdUsecase,
  );
  bind<IGenerateAuctionUploadUrlUsecase>(
    TYPES.IGenerateAuctionUploadUrlUsecase,
  ).to(GenerateAuctionUploadUrlUsecase);
  bind<IUpdateAuctionUsecase>(TYPES.IUpdateAuctionUsecase).to(
    UpdateAuctionUsecase,
  );
  bind<IGetBrowseAuctionsUsecase>(TYPES.IGetBrowseAuctionsUsecase).to(
    GetBrowseAuctionsUsecase,
  );
  bind<IPublishAuctionUsecase>(TYPES.IPublishAuctionUsecase).to(
    PublishAuctionUsecase,
  );
});
